import { isNullOrUndefined } from "util";
import { CLIEngine, Linter, Rule } from "eslint";
import ts = require("typescript/lib/tsserverlibrary");
import Path = require("upath");
import { Constants } from "./Constants";
import { DiagnosticIDDecorator } from "./Diagnostics/DiagnosticIDDecorator";
import { ILintDiagnostic } from "./Diagnostics/ILintDiagnostic";
import { IMockedLanguageService } from "./Diagnostics/IMockedLanguageService";
import { LintDiagnosticMap } from "./Diagnostics/LintDiagnosticMap";
import { Interceptor } from "./Interception/Interceptor";
import { Logger } from "./Logging/Logger";
import { PluginModule } from "./PluginModule";
import { ESLintRunner } from "./Runner/ESLintRunner";
import { IRunnerResult } from "./Runner/IRunnerResult";
import { Configuration } from "./Settings/Configuration";
import { ConfigurationManager } from "./Settings/ConfigurationManager";
import { ITSConfiguration } from "./Settings/ITSConfiguration";
import { LogLevel } from "./Logging/LogLevel";

/**
 * Represents a service for handling `eslint`-warnings.
 */
export class Plugin
{
    /**
     * The module of this plugin.
     */
    private pluginModule: PluginModule;

    /**
     * A component for managing configurations.
     */
    private configurationManager: ConfigurationManager;

    /**
     * The typescript-service.
     */
    private typescript: typeof ts;

    /**
     * The fix-actions for the project.
     */
    private lintDiagnostics = new Map<string, LintDiagnosticMap>();

    /**
     * A component for running eslint.
     */
    private runner: ESLintRunner;

    /**
     * A component for decorating fix-ids.
     */
    private idDecorator = new DiagnosticIDDecorator();

    /**
     * Initializes a new instance of the `Plugin` class.
     *
     * @param pluginModule
     * The module of this plugin.
     *
     * @param typescript
     * The typescript-server.
     *
     * @param pluginInfo
     * The information about the plugin.
     */
    public constructor(pluginModule: PluginModule, typescript: typeof ts, pluginInfo: ts.server.PluginCreateInfo)
    {
        this.pluginModule = pluginModule;
        this.configurationManager = new ConfigurationManager(this, pluginInfo);
        this.typescript = typescript;
        this.Logger?.Info("Initializing the plugin…");
        this.Logger?.Verbose(`Configuration: ${JSON.stringify(pluginInfo.config)}`);
        this.runner = new ESLintRunner(this, this.Logger?.CreateSubLogger(ESLintRunner.name));

        this.ConfigurationManager.ConfigUpdated.add(
            () =>
            {
                this.Logger?.Info("TSConfig configuration changed…");
                this.Project.refreshDiagnostics();
            });
    }

    /**
     * Gets the module of this plugin.
     */
    protected get PluginModule(): PluginModule
    {
        return this.pluginModule;
    }

    /**
     * Gets a component for managing configurations.
     */
    protected get ConfigurationManager(): ConfigurationManager
    {
        return this.configurationManager;
    }

    /**
     * Gets the configuration.
     */
    public get Config(): Configuration
    {
        return this.ConfigurationManager.Config;
    }

    /**
     * Gets a component for logging messages.
     */
    public get Logger(): Logger | undefined
    {
        if (this.Config.LogLevel !== LogLevel.None)
        {
            return this.pluginModule.Logger;
        }
        else
        {
            return undefined;
        }
    }

    /**
     * Gets or sets information for the plugin.
     */
    public get PluginInfo(): ts.server.PluginCreateInfo
    {
        return this.ConfigurationManager.PluginInfo;
    }

    public set PluginInfo(value)
    {
        this.ConfigurationManager.PluginInfo = value;
    }

    /**
     * Gets the language-service host.
     */
    public get LanguageServiceHost(): ts.LanguageServiceHost
    {
        return this.PluginInfo.languageServiceHost;
    }

    /**
     * Gets the project of the language-server.
     */
    public get Project(): ts.server.Project
    {
        return this.PluginInfo.project;
    }

    /**
     * Gets the program of the language-service.
     */
    public get Program(): ts.Program
    {
        return this.Project.getLanguageService().getProgram();
    }

    /**
     * Updates the configuration.
     *
     * @param config
     * The configuration to set.
     */
    public UpdateConfig(config: ITSConfiguration): void
    {
        this.Logger?.Info("Updating the configuration…");
        this.ConfigurationManager.Update(config);
    }

    /**
     * Adds the plugin to the specified language-service.
     *
     * @param languageService
     * The language-service to add the plugin to.
     */
    public Decorate(languageService: IMockedLanguageService): ts.LanguageService
    {
        if (!languageService[Constants.PluginInstalledSymbol])
        {
            let oldGetSupportedCodeFixes = this.typescript.getSupportedCodeFixes.bind(this.typescript);

            this.typescript.getSupportedCodeFixes = (): string[] => [
                ...oldGetSupportedCodeFixes(),
                Constants.ErrorCode.toString()
            ];

            let interceptor = new Interceptor<IMockedLanguageService>(languageService, true);
            this.InstallInterceptions(interceptor);
            interceptor.AddProperty(Constants.PluginInstalledSymbol, () => true);
            return interceptor.CreateProxy();
        }
        else
        {
            return languageService;
        }
    }

    /**
     * Creates diagnostic for a message.
     *
     * @param message
     * The message to create a diagnostic for.
     *
     * @param file
     * The file to add the diagnostic to.
     */
    protected CreateMessage(message: string, errorLevel: ts.DiagnosticCategory, file: ts.SourceFile): ts.Diagnostic
    {
        return this.CreateDiagnostic(file, { start: 0, length: 1 }, message, errorLevel);
    }

    /**
     * Creates a diagnostic for a deprecated rule.
     *
     * @param file
     * The file to add the diagnostic to.
     *
     * @param deprecation
     * The depreaction to create a warning for.
     */
    protected CreateDeprecationWarning(file: ts.SourceFile, deprecation: CLIEngine.DeprecatedRuleUse): ts.Diagnostic
    {
        let message = `The rule \`${deprecation.ruleId}\` is deprecated.\n`;
        message += "Please use ";

        if (deprecation.replacedBy.length > 1)
        {
            message += "these alternatives:\n";
            message += deprecation.replacedBy.slice(0, deprecation.replacedBy.length - 1).map((replacement) => `\`${replacement}\``).join(", ");
            message += ` and \`${deprecation.replacedBy[deprecation.replacedBy.length - 1]}\``;
        }
        else
        {
            message += `\`${deprecation.replacedBy[0]}\` instead.`;
        }

        return this.CreateDiagnostic(file, { start: 0, length: 1 }, message, ts.DiagnosticCategory.Warning);
    }

    /**
     * Creates a diagnostic-object for a lint-message.
     *
     * @param lintMessage
     * The lint-message to add.
     *
     * @param file
     * The file to add the diagnostic to.
     */
    protected CreateLintMessage(lintMessage: Linter.LintMessage, file: ts.SourceFile): ts.Diagnostic
    {
        let category: ts.DiagnosticCategory;
        let message = `${lintMessage.message}`;

        if (lintMessage.ruleId)
        {
            message = `${message} (${lintMessage.ruleId})`;
        }

        let span: ts.TextSpan = this.GetTextSpan(file, lintMessage);

        if (!this.Config.AlwaysShowRuleFailuresAsWarnings)
        {
            switch (lintMessage.severity)
            {
                case 1:
                    category = ts.DiagnosticCategory.Warning;
                    break;
                case 2:
                    category = ts.DiagnosticCategory.Error;
                    break;
            }
        }
        else
        {
            category = ts.DiagnosticCategory.Warning;
        }

        return this.CreateDiagnostic(file, span, message, category ?? ts.DiagnosticCategory.Warning);
    }

    /**
     * Creates a diagnostic for the specified text-span.
     *
     * @param textSpan
     * The text-span to create a diagnostic for.
     *
     * @param message
     * The message of the diagnostic.
     *
     * @param category
     * The category of the diagnostic.
     */
    protected CreateDiagnostic(file: ts.SourceFile, textSpan: ts.TextSpan, message: string, category: ts.DiagnosticCategory): ts.Diagnostic
    {
        return {
            file,
            start: textSpan.start,
            length: textSpan.length,
            messageText: message,
            category,
            source: Constants.ErrorSource,
            code: Constants.ErrorCode
        };
    }

    /**
     * Gets the text-span of a lint-message.
     *
     * @param file
     * The file to get the position.
     *
     * @param lintMessage
     * The lint-message whose text-span to get.
     */
    protected GetTextSpan(file: ts.SourceFile, lintMessage: Linter.LintMessage): ts.TextSpan
    {
        let positionResolver = (line: number, column: number): number =>
        {
            if (line)
            {
                let result: number;
                let lineStarts = file.getLineStarts();

                if (line > lineStarts.length)
                {
                    result = file.getLineEndOfPosition(lineStarts[lineStarts.length - 1]);
                }
                else
                {
                    let lineStart = lineStarts[line - 1];
                    let lineEnd = file.getLineEndOfPosition(lineStart);
                    line--;

                    if (isNullOrUndefined(column))
                    {
                        result = lineEnd;
                    }
                    else
                    {
                        column--;

                        if (column <= (file.getLineEndOfPosition(lineStart) - lineStart))
                        {
                            result = file.getPositionOfLineAndCharacter(line, column);
                        }
                        else
                        {
                            result = lineEnd;
                        }
                    }
                }

                return result;
            }
            else
            {
                return null;
            }
        };

        let start = positionResolver(lintMessage.line, lintMessage.column);
        let end = positionResolver(lintMessage.endLine, lintMessage.endColumn) ?? start;

        return {
            start,
            length: end - start
        };
    }

    /**
     * Installs interceptions to the interceptor.
     *
     * @param interceptor
     * The interceptor to install the interceptions to.
     */
    protected InstallInterceptions(interceptor: Interceptor<ts.LanguageService>): void
    {
        interceptor.AddMethod(
            "getSemanticDiagnostics",
            (target, delegate, fileName) =>
            {
                let diagnostics = delegate(fileName);

                if (!this.Config.SuppressWhileTypeErrorsPresent || (diagnostics.length === 0))
                {
                    try
                    {
                        let result: IRunnerResult;
                        let file = this.Program.getSourceFile(fileName);
                        this.Logger?.Info(`Computing eslint semantic diagnostics for '${fileName}'…`);

                        if (this.lintDiagnostics.has(fileName))
                        {
                            this.lintDiagnostics.delete(fileName);
                        }

                        try
                        {
                            result = this.runner.RunESLint(file);
                        }
                        catch (exception)
                        {
                            let errorMessage = "unknown error";

                            if (typeof exception.message === "string" || exception.message instanceof String)
                            {
                                errorMessage = exception.message;
                            }

                            this.Logger?.Info(`eslint error ${errorMessage}`);
                            diagnostics.unshift(this.CreateMessage(errorMessage, ts.DiagnosticCategory.Error, file));
                            return diagnostics;
                        }

                        for (let warning of result.warnings)
                        {
                            diagnostics.unshift(this.CreateMessage(warning, ts.DiagnosticCategory.Warning, file));
                        }

                        if (!this.Config.SuppressDeprecationWarnings)
                        {
                            for (let deprecation of result.report.usedDeprecatedRules)
                            {
                                diagnostics.unshift(this.CreateDeprecationWarning(file, deprecation));
                            }
                        }

                        let lintMessages = this.FilterMessagesForFile(fileName, result.report);

                        for (let lintMessage of lintMessages)
                        {
                            if (lintMessage.severity > 0)
                            {
                                let diagnostic = this.CreateLintMessage(lintMessage, file);
                                diagnostics.push(diagnostic);

                                let fixable = !isNullOrUndefined(lintMessage.fix);
                                let documentDiagnostics = this.lintDiagnostics.get(file.fileName);

                                if (isNullOrUndefined(documentDiagnostics))
                                {
                                    documentDiagnostics = new LintDiagnosticMap();
                                    this.lintDiagnostics.set(file.fileName, documentDiagnostics);
                                }

                                documentDiagnostics.Set(
                                    diagnostic.start,
                                    diagnostic.start + diagnostic.length,
                                    {
                                        lintMessage,
                                        fixable
                                    });
                            }
                        }
                    }
                    catch (exception)
                    {
                        this.Logger?.Info(`eslint-language service error: ${exception}`);
                        this.Logger?.Info(`Stack trace: ${exception.stack}`);
                    }
                }

                return diagnostics;
            });

        interceptor.AddMethod(
            "getCodeFixesAtPosition",
            (target, delegate, fileName, start, end, errorCodes, formatOptions, userPreferences) =>
            {
                this.Logger?.Verbose(`Code-fixes requested from offset ${start} to ${end}`);
                let fixes = Array.from(delegate(fileName, start, end, errorCodes, formatOptions, userPreferences));

                if ((fixes.length === 0) || !this.Config.SuppressWhileTypeErrorsPresent)
                {
                    this.Logger?.Verbose("Searching for code fixes…");
                    let documentDiagnostics = this.lintDiagnostics.get(fileName);
                    this.Logger?.Verbose(`The current file has${documentDiagnostics ? "" : "no"} diagnostics.`);

                    if (documentDiagnostics)
                    {
                        let lintDiagnostic = documentDiagnostics.Get(start, end);

                        if (lintDiagnostic)
                        {
                            if (lintDiagnostic.fixable)
                            {
                                let fix = this.CreateFixAction(fileName, lintDiagnostic.lintMessage);

                                if (this.GetFixableDiagnostics(fileName, lintDiagnostic.lintMessage.ruleId).length > 1)
                                {
                                    fix.fixId = this.idDecorator.DecorateCombinedFix(lintDiagnostic.lintMessage.ruleId);
                                    fix.fixAllDescription = `Fix all: ${lintDiagnostic.lintMessage.ruleId}`;
                                }

                                fixes.push(fix);
                                fixes.push(this.CreateFixAllQuickFix(fileName));
                            }

                            fixes.push(this.CreateDisableRuleFix(this.Program.getSourceFile(fileName), lintDiagnostic.lintMessage));
                        }
                    }
                }

                return fixes;
            });

        interceptor.AddMethod(
            "getCombinedCodeFix",
            (target, delegate, scope, fixId, formatOptions, preferences) =>
            {
                let ruleName = this.idDecorator.UndecorateCombinedFix(String(fixId));

                if (ruleName !== undefined)
                {
                    let fixes = this.GetFixableDiagnostics(
                        scope.fileName,
                        ruleName).map(
                            (diagnostic) => diagnostic.lintMessage.fix);

                    if (fixes.length > 0)
                    {
                        return {
                            changes: [
                                {
                                    fileName: scope.fileName,
                                    textChanges: fixes.map((fix) => this.ConvertFixToTextChange(fix))
                                }
                            ]
                        };
                    }
                    else
                    {
                        return { changes: [] };
                    }
                }
                else
                {
                    return delegate(scope, fixId, formatOptions, preferences);
                }
            });
    }

    /**
     * Converts a fix to a `TextChange` object.
     *
     * @param fix
     * The fix to convert.
     */
    private ConvertFixToTextChange(fix: Rule.Fix): ts.TextChange
    {
        return {
            newText: fix.text,
            span: {
                start: fix.range[0],
                length: fix.range[1] - fix.range[0]
            }
        };
    }

    /**
     * Gets all lint-diagnostics with the specified rule-id in the specified file.
     *
     * @param fileName
     * The file to look for lint-diagnostics.
     *
     * @param ruleID
     * The rule-ID of the lint-diagnostics to look for.
     */
    private GetLintDiagnostics(fileName: string, ruleID: string): ILintDiagnostic[]
    {
        let result: ILintDiagnostic[] = [];

        for (let lintDiagnostic of this.lintDiagnostics.get(fileName).Values())
        {
            if (lintDiagnostic.lintMessage.ruleId === ruleID)
            {
                result.push(lintDiagnostic);
            }
        }

        return result;
    }

    /**
     * Gets all lint-diagnostics with the specified rule-id in the specified file which provide fixes.
     *
     * @param fileName
     * The file to look for lint-diagnostics.
     *
     * @param ruleID
     * The rule-ID of the diagnostics to look for.
     */
    private GetFixableDiagnostics(fileName: string, ruleID: string): ILintDiagnostic[]
    {
        let result: ILintDiagnostic[] = [];

        for (let lintDiagnostic of this.GetLintDiagnostics(fileName, ruleID))
        {
            if (lintDiagnostic.fixable)
            {
                result.push(lintDiagnostic);
            }
        }

        return result;
    }

    /**
     * Creates a fix-action.
     *
     * @param fileName
     * The name of the file to add the action to.
     *
     * @param lintMessage
     * The lint-message to convert.
     */
    private CreateFixAction(fileName: string, lintMessage: Linter.LintMessage): ts.CodeFixAction
    {
        return {
            description: `Fix: ${lintMessage.message}`,
            fixName: this.idDecorator.DecorateFix(lintMessage.ruleId),
            changes: [
                {
                    fileName,
                    textChanges: [
                        this.ConvertFixToTextChange(lintMessage.fix)
                    ]
                }
            ]
        };
    }

    /**
     * Creates a fix for all auto-fixables in the file with the specified `fileName`.
     *
     * @param fileName
     * The name of the file to create the fix for.
     */
    private CreateFixAllQuickFix(fileName: string): ts.CodeFixAction
    {
        let applicableFixes: Rule.Fix[] = [];
        let fixes = Array.from(
            this.lintDiagnostics.get(fileName).Values()).filter(
                (lintDiagnostic) => lintDiagnostic.fixable).map(
                    (lintDiagnostic) => lintDiagnostic.lintMessage.fix).sort(
                        (a, b) => a.range[0] - b.range[0]);

        for (let i = 0; i < fixes.length; i++)
        {
            if (i === 0 || !(applicableFixes[applicableFixes.length - 1].range[1] >= fixes[i].range[0]))
            {
                applicableFixes.push(fixes[i]);
            }
        }

        return {
            description: "Fix all auto-fixable eslint failures",
            fixName: this.idDecorator.DecorateFix("fix-all"),
            changes: [
                {
                    fileName,
                    textChanges: applicableFixes.map((fix) => this.ConvertFixToTextChange(fix))
                }
            ]
        };
    }

    /**
     * Creates a fix for disabling the rule for the specified `failure`.
     *
     * @param file
     * THe file to create the fix for.
     *
     * @param failure
     * The failure to disable.
     */
    private CreateDisableRuleFix(file: ts.SourceFile, failure: Linter.LintMessage): ts.CodeFixAction
    {
        let line = failure.line - 1;
        let lineStarts = file.getLineStarts();
        let lineStart = lineStarts[line];
        let prefix = "";
        let snapshot = this.LanguageServiceHost.getScriptSnapshot(file.fileName);

        if (snapshot)
        {
            let lineEnd = line < lineStarts.length - 1 ? lineStarts[line + 1] : file.end;
            let lineText = snapshot.getText(lineStart, lineEnd);
            prefix = /^(?<indent>\s*).*/.exec(lineText).groups["indent"];
        }

        return {
            description: `Disable rule '${failure.ruleId}'`,
            fixName: this.idDecorator.DecorateDisableFix(failure.ruleId),
            changes: [
                {
                    fileName: file.fileName,
                    textChanges: [
                        {
                            newText: `${prefix}// eslint-disable-next-line ${failure.ruleId}\n`,
                            span: { start: lineStart, length: 0 }
                        }
                    ]
                }
            ]
        };
    }

    /**
     * Filters messages for the specified file.
     *
     * @param filePath
     * The file to get the messages for.
     *
     * @param report
     * An eslint-report.
     */
    private FilterMessagesForFile(filePath: string, report: CLIEngine.LintReport): Linter.LintMessage[]
    {
        let normalizedPath = Path.normalize(Path.resolve(filePath));
        let normalizedFiles = new Map<string, string>();

        return report.results.flatMap(
            (lintResult) =>
            {
                let fileName = lintResult.filePath;

                if (!normalizedFiles.has(fileName))
                {
                    normalizedFiles.set(fileName, Path.normalize(Path.resolve(fileName)));
                }

                if (normalizedFiles.get(fileName) === normalizedPath)
                {
                    return lintResult.messages;
                }
                else
                {
                    return [];
                }
            });
    }
}
