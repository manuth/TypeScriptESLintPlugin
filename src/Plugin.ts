import { Interceptor } from "@manuth/interceptor";
import { Linter, Rule } from "eslint";
import ts = require("typescript/lib/tsserverlibrary");
import { Constants } from "./Constants";
import { ConfigNotFoundMessage } from "./Diagnostics/ConfigNotFoundMessage";
import { DeprecationMessage } from "./Diagnostics/DeprecationMessage";
import { DiagnosticIDDecorator } from "./Diagnostics/DiagnosticIDDecorator";
import { ESLintDiagnostic } from "./Diagnostics/ESLintDiagnostic";
import { IDiagnostic } from "./Diagnostics/IDiagnostic";
import { ILintDiagnostic } from "./Diagnostics/ILintDiagnostic";
import { IMockedLanguageService } from "./Diagnostics/IMockedLanguageService";
import { LintDiagnosticMap } from "./Diagnostics/LintDiagnosticMap";
import { LoggerBase } from "./Logging/LoggerBase";
import { LogLevel } from "./Logging/LogLevel";
import { PluginLogger } from "./Logging/PluginLogger";
import { PluginModule } from "./PluginModule";
import { ESLintRunner } from "./Runner/ESLintRunner";
import { Configuration } from "./Settings/Configuration";
import { ConfigurationManager } from "./Settings/ConfigurationManager";
import { ITSConfiguration } from "./Settings/ITSConfiguration";

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
     * A component for logging messages.
     */
    private logger: LoggerBase = new PluginLogger(this, Constants.PluginName);

    /**
     * A component for managing configurations.
     */
    private configurationManager: ConfigurationManager = new ConfigurationManager(this);

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
     * @param pluginInfo
     * The information about the plugin.
     */
    public constructor(pluginModule: PluginModule, pluginInfo: ts.server.PluginCreateInfo)
    {
        this.ConfigurationManager.PluginInfo = pluginInfo;
        this.pluginModule = pluginModule;
        this.Logger?.Info("Initializing the plugin…");
        this.Logger?.Verbose(`Configuration: ${JSON.stringify(pluginInfo.config)}`);
        this.runner = new ESLintRunner(this);

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
     * Gets the typescript-service.
     */
    public get TypeScript(): typeof ts
    {
        return this.PluginModule.TypeScript;
    }

    /**
     * Gets a component for writing log-messages.
     */
    public get RealLogger(): LoggerBase
    {
        return this.logger;
    }

    /**
     * Gets a component for writing log-messages.
     */
    public get Logger(): LoggerBase
    {
        if (this.Config.LogLevel !== LogLevel.None)
        {
            return this.RealLogger;
        }
        else
        {
            return null;
        }
    }

    /**
     * Gets a component for managing configurations.
     */
    public get ConfigurationManager(): ConfigurationManager
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
     * Gets or sets information for the plugin.
     */
    public get PluginInfo(): ts.server.PluginCreateInfo
    {
        return this.ConfigurationManager.PluginInfo;
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
     *
     * @returns
     * The decorated language-service.
     */
    public Decorate(languageService: IMockedLanguageService): ts.LanguageService
    {
        if (
            !languageService[Constants.PluginInstalledSymbol] &&
            !languageService[Constants.PluginInstalledDescription]?.())
        {
            let oldGetSupportedCodeFixes = this.TypeScript.getSupportedCodeFixes.bind(this.TypeScript);

            this.TypeScript.getSupportedCodeFixes = (): string[] => [
                ...oldGetSupportedCodeFixes(),
                Constants.ErrorCode.toString()
            ];

            let interceptor = new Interceptor<IMockedLanguageService>(languageService, true);
            this.InstallInterceptions(interceptor);
            languageService[Constants.PluginInstalledDescription] = (): boolean => true;
            languageService[Constants.PluginInstalledSymbol] = true;

            interceptor.AddProperty(
                Constants.PluginInstalledSymbol,
                {
                    Get: () => true
                });

            return interceptor.Proxy;
        }
        else
        {
            return languageService;
        }
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
                    let result: IDiagnostic[] = [];
                    let file = this.Program.getSourceFile(fileName);

                    this.Logger?.Info(`Computing eslint semantic diagnostics for '${fileName}'…`);

                    if (this.lintDiagnostics.has(fileName))
                    {
                        this.lintDiagnostics.delete(fileName);
                    }

                    let report = this.runner.RunESLint(file);

                    for (let diagnostic of report)
                    {
                        if (diagnostic instanceof ConfigNotFoundMessage)
                        {
                            if (!this.Config.SuppressConfigNotFoundError)
                            {
                                result.push(diagnostic);
                            }
                        }
                        else if (diagnostic instanceof DeprecationMessage)
                        {
                            if (!this.Config.SuppressDeprecationWarnings)
                            {
                                result.push(diagnostic);
                            }
                        }
                        else if (diagnostic instanceof ESLintDiagnostic)
                        {
                            if (diagnostic.LintMessage.severity > 0)
                            {
                                let documentDiagnostics = this.lintDiagnostics.get(file.fileName);
                                result.push(diagnostic);

                                if (!documentDiagnostics)
                                {
                                    documentDiagnostics = new LintDiagnosticMap();
                                    this.lintDiagnostics.set(file.fileName, documentDiagnostics);
                                }

                                documentDiagnostics.Set(
                                    diagnostic.Parsed.start,
                                    diagnostic.Parsed.start + diagnostic.Parsed.length,
                                    {
                                        lintMessage: diagnostic.LintMessage,
                                        fixable: Boolean(diagnostic.LintMessage.fix)
                                    });
                            }
                        }
                        else
                        {
                            result.push(diagnostic);
                        }
                    }

                    diagnostics.push(...result.map((diagnostic) => diagnostic.Parsed));
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
     *
     * @returns
     * A `ts.TextChange` object representing the rule-fix.
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
     *
     * @returns
     * The `ILintDiagnostic`s with the specified `ruleID` for the specified file.
     */
    private GetLintDiagnostics(fileName: string, ruleID: string): ILintDiagnostic[]
    {
        let result: ILintDiagnostic[] = [];

        for (let lintDiagnostic of this.lintDiagnostics.get(fileName).Values)
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
     *
     * @returns
     * All fixable diagnostics with the specified rule-id for the specified file.
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
     *
     * @returns
     * The newly created fix-action.
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
     *
     * @returns
     * The newly created fix-action.
     */
    private CreateFixAllQuickFix(fileName: string): ts.CodeFixAction
    {
        let applicableFixes: Rule.Fix[] = [];
        let fixes = Array.from(
            this.lintDiagnostics.get(fileName).Values).filter(
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
     *
     * @returns
     * The newly created fix for disabling the rule.
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
}
