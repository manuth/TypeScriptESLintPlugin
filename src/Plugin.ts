import { isNullOrUndefined } from "util";
import { CLIEngine, Linter, Rule } from "eslint";
import TSServerLibrary = require("typescript/lib/tsserverlibrary");
import Path = require("upath");
import { Constants } from "./Constants";
import { IProblem } from "./Diagnostics/IProblem";
import { ProblemMap } from "./Diagnostics/ProblemMap";
import { Interceptor } from "./Interceptor";
import { Logger } from "./Logging/Logger";
import { PluginModule } from "./PluginModule";
import { ESLintRunner } from "./Runner/ESLintRunner";
import { IRunnerResult } from "./Runner/IRunnerResult";
import { Configuration } from "./Settings/Configuration";
import { ConfigurationManager } from "./Settings/ConfigurationManager";

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
     * A symbol which indicates whether the plugin is installed.
     */
    private pluginInstalledSymbol = Symbol("__typescriptEslintPluginInstalled__");

    /**
     * The typescript-service.
     */
    private typescript: typeof TSServerLibrary;

    /**
     * The language-service host.
     */
    private languageServiceHost: TSServerLibrary.LanguageServiceHost;

    /**
     * The project which is processed by the plugin.
     */
    private project: TSServerLibrary.server.Project;

    /**
     * The fix-actions for the project.
     */
    private problems = new Map<string, ProblemMap>();

    /**
     * A component for running eslint.
     */
    private runner: ESLintRunner;

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
    public constructor(pluginModule: PluginModule, typescript: typeof TSServerLibrary, pluginInfo: TSServerLibrary.server.PluginCreateInfo)
    {
        this.pluginModule = pluginModule;
        this.typescript = typescript;
        this.languageServiceHost = pluginInfo.languageServiceHost;
        this.project = pluginInfo.project;
        this.Logger.Info("Initializing the plugin…");
        this.runner = new ESLintRunner(this.Logger.CreateSubLogger(ESLintRunner.name));

        this.ConfigurationManager.ConfigUpdated.add(
            () =>
            {
                this.Logger.Info("TSConfig configuration changed…");
                this.project.refreshDiagnostics();
            });
    }

    /**
     * Gets a component for managing configurations.
     */
    public get ConfigurationManager(): ConfigurationManager
    {
        return this.pluginModule.ConfigurationManager;
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
    public get Logger(): Logger
    {
        return this.pluginModule.Logger;
    }

    /**
     * Adds the plugin to the specified language-service.
     *
     * @param languageService
     * The language-service to add the plugin to.
     */
    public Decorate(languageService: TSServerLibrary.LanguageService): TSServerLibrary.LanguageService
    {
        if (!(languageService as any)[this.pluginInstalledSymbol])
        {
            let oldGetSupportedCodeFixes = this.typescript.getSupportedCodeFixes.bind(this.typescript);

            this.typescript.getSupportedCodeFixes = (): string[] => [
                ...oldGetSupportedCodeFixes(),
                Constants.ErrorCode.toString()
            ];

            let interceptor = new Interceptor<TSServerLibrary.LanguageService>(languageService);
            this.InstallInterceptions(interceptor);
            return new Proxy(
                interceptor.Create(),
                {
                    get: (target: TSServerLibrary.LanguageService, property: keyof TSServerLibrary.LanguageService & Plugin["pluginInstalledSymbol"]): any =>
                    {
                        if (property === this.pluginInstalledSymbol)
                        {
                            return true;
                        }

                        return target[property];
                    }
                });
        }
        else
        {
            return languageService;
        }
    }

    /**
     * Gets the actual typescript-program.
     */
    protected GetProgram(): TSServerLibrary.Program
    {
        return this.project.getLanguageService().getProgram();
    }

    /**
     * Creates a diagnostic-error.
     *
     * @param problem
     * The problem to add.
     *
     * @param file
     * The file to add the problem to.
     */
    protected CreateDiagnostic(problem: Linter.LintMessage, file: TSServerLibrary.SourceFile): TSServerLibrary.Diagnostic
    {
        let category: TSServerLibrary.DiagnosticCategory;
        let message = `${problem.message} (${problem.ruleId})`;
        let start = this.GetPosition(file, problem.line, problem.column);
        let end = this.GetPosition(file, problem.endLine, problem.endColumn);

        switch (problem.severity)
        {
            case 1:
                category = TSServerLibrary.DiagnosticCategory.Warning;
                break;
            case 2:
                category = TSServerLibrary.DiagnosticCategory.Error;
                break;
        }

        return {
            file,
            start,
            length: Math.max(0, end - start),
            messageText: message,
            category: this.Config.AlwaysShowRuleFailuresAsWarnings ? TSServerLibrary.DiagnosticCategory.Warning : category,
            source: Constants.ErrorSource,
            code: Constants.ErrorCode
        };
    }

    /**
     * Creates an error message.
     *
     * @param errorMessage
     * The error-message to create.
     *
     * @param file
     * The file to add the message to.
     */
    protected CreateError(errorMessage: string, errorLevel: TSServerLibrary.DiagnosticCategory, file: TSServerLibrary.SourceFile): TSServerLibrary.Diagnostic
    {
        return {
            file,
            start: 0,
            length: 1,
            messageText: errorMessage,
            category: errorLevel,
            source: Constants.ErrorSource,
            code: Constants.ErrorCode
        };
    }

    /**
     * Gets the position of a line and a column in the specified file.
     *
     * @param file
     * The file to get the position.
     *
     * @param line
     * The line of the position to get.
     *
     * @param column
     * The column of the position to get.
     */
    protected GetPosition(file: TSServerLibrary.SourceFile, line: number, column: number): number
    {
        if (line && column)
        {
            return file.getPositionOfLineAndCharacter(line - 1, column - 1);
        }
        else
        {
            return null;
        }
    }

    /**
     * Installs interceptions to the interceptor.
     *
     * @param interceptor
     * The interceptor to install the interceptions to.
     */
    protected InstallInterceptions(interceptor: Interceptor<TSServerLibrary.LanguageService>): void
    {
        interceptor.Add(
            "getSemanticDiagnostics",
            (delegate, fileName) =>
            {
                let diagnostics = delegate(fileName);

                if (!this.Config.SuppressWhileTypeErrorsPresent || (diagnostics.length === 0))
                {
                    try
                    {
                        let result: IRunnerResult;
                        let program = this.GetProgram();
                        let file = program.getSourceFile(fileName);
                        this.Logger.Info(`Computing eslint semantic diagnostics for '${fileName}'…`);

                        if (this.problems.has(fileName))
                        {
                            this.problems.delete(fileName);
                        }

                        try
                        {
                            // ToDo maybe fiddle with settings.
                            result = this.runner.RunESLint(program, fileName, this.Config);
                        }
                        catch (exception)
                        {
                            let errorMessage = "unknown error";

                            if (typeof exception.message === "string" || exception.message instanceof String)
                            {
                                errorMessage = exception.message;
                            }

                            this.Logger.Info("eslint error" + errorMessage);
                            diagnostics.unshift(this.CreateError(errorMessage, TSServerLibrary.DiagnosticCategory.Error, file));
                            return diagnostics;
                        }

                        if (result.warnings)
                        {
                            for (let warning of result.warnings)
                            {
                                diagnostics.unshift(this.CreateError(warning, TSServerLibrary.DiagnosticCategory.Warning, file));
                            }
                        }

                        let problems = this.FilterProblemsForFile(fileName, result.result);

                        for (let problem of problems)
                        {
                            if (problem.severity > 0)
                            {
                                diagnostics.push(this.CreateDiagnostic(problem, file));

                                let fixable = !isNullOrUndefined(problem.fix);
                                let documentProblems = this.problems.get(file.fileName);

                                if (isNullOrUndefined(documentProblems))
                                {
                                    documentProblems = new ProblemMap();
                                    this.problems.set(file.fileName, documentProblems);
                                }

                                documentProblems.Set(
                                    this.GetPosition(file, problem.line, problem.column),
                                    this.GetPosition(file, problem.endLine, problem.endColumn),
                                    {
                                        failure: problem,
                                        fixable
                                    });
                            }
                        }
                    }
                    catch (exception)
                    {
                        this.Logger.Info(`eslint-language service error: ${exception}`);
                        this.Logger.Info(`Stack trace: ${exception.stack}`);
                    }
                }

                return diagnostics;
            });

        interceptor.Add(
            "getCodeFixesAtPosition",
            (delegate, fileName, start, end, errorCodes, formatOptions, userPreferences) =>
            {
                let fixes = Array.from(delegate(fileName, start, end, errorCodes, formatOptions, userPreferences));

                if ((fixes.length === 0) || !this.Config.SuppressWhileTypeErrorsPresent)
                {
                    this.Logger.Verbose("Searching for code fixes…");
                    let documentFixes = this.problems.get(fileName);

                    if (documentFixes)
                    {
                        let problem = documentFixes.Get(start, end);

                        if (problem)
                        {
                            if (problem.fixable)
                            {
                                let fix = this.CreateFixAction(fileName, problem.failure);

                                if (this.GetFixes(fileName, problem.failure.ruleId).length > 1)
                                {
                                    fix.fixId = `eslint:${problem.failure.ruleId}`;
                                    fix.fixAllDescription = `Fix all: ${problem.failure.ruleId}`;
                                }

                                fixes.push(fix);
                                fixes.push(this.CreateFixAllQuickFix(fileName));
                            }

                            fixes.push(this.GetDisableRuleFix(this.GetProgram().getSourceFile(fileName), problem.failure));
                        }
                    }
                }

                return fixes;
            });

        interceptor.Add(
            "getCombinedCodeFix",
            (delegate, scope, fixId, formatOptions, preferences) =>
            {
                let ruleName;

                if (typeof fixId === "string" &&
                    fixId.startsWith("eslint:"))
                {
                    ruleName = fixId.replace(/^eslint:/, "");
                    let fixes = this.GetFixes(scope.fileName, ruleName).map((problem) => problem.failure.fix);

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
    private ConvertFixToTextChange(fix: Rule.Fix): TSServerLibrary.TextChange
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
     * Gets all problems with the specified rule-id in the specified file.
     *
     * @param fileName
     * The file to look for problems.
     *
     * @param ruleID
     * The rule-ID of the problems to look for.
     */
    private GetProblems(fileName: string, ruleID: string): IProblem[]
    {
        let result: IProblem[] = [];

        for (let problem of this.problems.get(fileName).Values())
        {
            if (problem.failure.ruleId === ruleID)
            {
                result.push(problem);
            }
        }

        return result;
    }

    /**
     * Gets all problems with the specified rule-id in the specified file which provide fixes.
     *
     * @param fileName
     * The file to look for problems.
     * @param ruleID
     * The rule-ID of the problems to look for.
     */
    private GetFixes(fileName: string, ruleID: string): IProblem[]
    {
        let result: IProblem[] = [];

        for (let problem of this.GetProblems(fileName, ruleID))
        {
            if (problem.fixable)
            {
                result.push(problem);
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
     * @param failure
     * The failure to convert.
     */
    private CreateFixAction(fileName: string, failure: Linter.LintMessage): TSServerLibrary.CodeFixAction
    {
        return {
            description: `Fix: ${failure.message}`,
            fixName: `eslint:${failure.ruleId}`,
            changes: [
                {
                    fileName,
                    textChanges: [
                        this.ConvertFixToTextChange(failure.fix)
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
    private CreateFixAllQuickFix(fileName: string): TSServerLibrary.CodeFixAction
    {
        let replacements: Rule.Fix[] = [];
        let fixes = Array.from(this.problems.get(fileName).Values()).filter((problem) => problem.fixable).map((problem) => problem.failure.fix).sort((a, b) => a.range[0] - b.range[0]);

        for (let i = 0; i < fixes.length; i++)
        {
            if (i === 0 || !(replacements[replacements.length - 1].range[1] >= fixes[i].range[0]))
            {
                replacements.push(fixes[i]);
            }
        }

        return {
            description: "Fix all auto-fixable eslint failures",
            fixName: "eslint:fix-all",
            changes: [
                {
                    fileName,
                    textChanges: replacements.map((fix) => this.ConvertFixToTextChange(fix))
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
    private GetDisableRuleFix(file: TSServerLibrary.SourceFile, failure: Linter.LintMessage): TSServerLibrary.CodeFixAction
    {
        let line = failure.line - 1;
        let lineStarts = file.getLineStarts();
        let lineStart = lineStarts[line];
        let prefix = "";
        let snapshot = this.languageServiceHost.getScriptSnapshot(file.fileName);

        if (snapshot)
        {
            let lineEnd = line < lineStarts.length - 1 ? lineStarts[line + 1] : file.end;
            let lineText = snapshot.getText(lineStart, lineEnd);
            prefix = /^(\s*).*/.exec(lineText)[0];
        }

        return {
            description: `Disable rule '${failure.ruleId}'`,
            fixName: `eslint:disable:${failure.ruleId}`,
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
     * Filters problems for the specified file.
     *
     * @param filePath
     * The file to get the problems for.
     *
     * @param failures
     * The problems to filter.
     */
    private FilterProblemsForFile(filePath: string, failures: CLIEngine.LintReport): Linter.LintMessage[]
    {
        let normalizedPath = Path.normalize(Path.resolve(filePath));
        let normalizedFiles = new Map<string, string>();

        return failures.results.flatMap(
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