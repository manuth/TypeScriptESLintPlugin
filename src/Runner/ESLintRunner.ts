import { execSync, spawnSync } from "child_process";
import { delimiter } from "path";
import { MRUCache } from "@thi.ng/cache";
import eslint = require("eslint");
import type ts = require("typescript/lib/tsserverlibrary");
import { basename, dirname, normalize, sep } from "upath";
import { ConfigNotFoundMessage } from "../Diagnostics/ConfigNotFoundMessage";
import { DeprecationMessage } from "../Diagnostics/DeprecationMessage";
import { DiagnosticMessage } from "../Diagnostics/DiagnosticMessage";
import { ESLintDiagnostic } from "../Diagnostics/ESLintDiagnostic";
import { ESLintNotInstalledMessage } from "../Diagnostics/ESLintNotInstalledMessage";
import { IDiagnostic } from "../Diagnostics/IDiagnostic";
import { LabeledLogger } from "../Logging/LabeledLogger";
import { LoggerBase } from "../Logging/LoggerBase";
import { LogLevel } from "../Logging/LogLevel";
import { Plugin } from "../Plugin";
import { Configuration } from "../Settings/Configuration";
import { PackageManager } from "../Settings/PackageManager";

/**
 * Provides the functionality to run `eslint`.
 */
export class ESLintRunner
{
    /**
     * The plugin of this runner.
     */
    private plugin: Plugin;

    /**
     * A set of documents and functions for resolving their linter.
     */
    // eslint-disable-next-line deprecation/deprecation
    private document2LibraryCache = new MRUCache<string, () => eslint.CLIEngine>([], { maxsize: 100 });

    /**
     * The paths to the package-managers.
     */
    private packageManagerPaths = new Map<PackageManager, string>();

    /**
     * Initializes a new instance of the {@link ESLintRunner `ESLintRunner`} class.
     *
     * @param plugin
     * The plugin of the runner.
     */
    public constructor(plugin: Plugin)
    {
        this.plugin = plugin;
    }

    /**
     * Gets the plugin of the runner.
     */
    public get Plugin(): Plugin
    {
        return this.plugin;
    }

    /**
     * Gets the typescript-server.
     */
    public get TypeScript(): typeof ts
    {
        return this.Plugin.TypeScript;
    }

    /**
     * Gets a component for writing log-messages.
     */
    public get RealLogger(): LoggerBase
    {
        return this.Plugin.RealLogger.CreateSubLogger(ESLintRunner.name);
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
     * Gets a component for writing log-messages.
     */
    public get RunnerLogger(): LabeledLogger
    {
        if (this.Config.LogLevel !== LogLevel.None)
        {
            return new LabeledLogger(this.RealLogger);
        }
        else
        {
            return null;
        }
    }

    /**
     * Gets the configuration of the plugin.
     */
    public get Config(): Configuration
    {
        return this.Plugin.Config;
    }

    /**
     * Gets the program of the language-server.
     */
    public get Program(): ts.Program
    {
        return this.Plugin.Program;
    }

    /**
     * Gets the language-service host.
     */
    public get LanguageServiceHost(): ts.LanguageServiceHost
    {
        return this.Plugin.LanguageServiceHost;
    }

    /**
     * Checks a file using `eslint`.
     *
     * @param file
     * The file to check.
     *
     * @returns
     * The result of the lint.
     */
    public RunESLint(file: ts.SourceFile): IDiagnostic[]
    {
        let result: IDiagnostic[] = [];
        this.RunnerLogger?.Log(nameof(this.RunESLint), "Starting…");

        if (!this.document2LibraryCache.has(file.fileName))
        {
            this.RunnerLogger?.Log(nameof(this.RunESLint), "Preparing to load the `eslint` library");
            this.document2LibraryCache.set(file.fileName, this.LoadLibrary(file.fileName));
        }

        this.RunnerLogger?.Log(nameof(this.RunESLint), "Loading the `eslint` library");
        // eslint-disable-next-line deprecation/deprecation
        let linter = this.document2LibraryCache.get(file.fileName)?.() as eslint.CLIEngine;

        if (!linter)
        {
            this.RunnerLogger?.Log(nameof(this.RunESLint), "The `eslint` package is not installed!");
            this.document2LibraryCache.delete(file.fileName);

            result.push(
                new ESLintNotInstalledMessage(
                    this.Plugin,
                    file,
                    this.TypeScript.DiagnosticCategory.Warning));
        }
        else
        {
            this.RunnerLogger?.Log(nameof(this.RunESLint), "Successfully loaded the `eslint` package", LogLevel.Verbose);
            this.RunnerLogger?.Log(nameof(this.RunESLint), `Validating '${file.fileName}'…`);
            result.push(...this.Run(file, linter));
        }

        return result;
    }

    /**
     * Checks a file using `eslint`.
     *
     * @param file
     * The file to check.
     *
     * @param linter
     * The linter.
     *
     * @returns
     * The result of the lint.
     */
    // eslint-disable-next-line deprecation/deprecation
    protected Run(file: ts.SourceFile, linter: eslint.CLIEngine): IDiagnostic[]
    {
        let result: IDiagnostic[] = [];
        let currentDirectory = process.cwd();
        let scriptKind = this.LanguageServiceHost.getScriptKind(file.fileName);
        this.RunnerLogger?.Log(nameof(this.Run), `Starting validation for ${file.fileName}…`);
        this.RunnerLogger?.Log(nameof(this.Run), "Detecting the ScriptKind of the file…");
        this.RunnerLogger?.Log(nameof(this.Run), `${file.fileName} is a ${this.TypeScript.ScriptKind[this.LanguageServiceHost.getScriptKind(file.fileName)]}-file`);
        this.RunnerLogger?.Log(nameof(this.Run), "Printing the configuration for the file…");
        this.RunnerLogger?.Log(nameof(this.Run), this.Config.ToJSON());
        process.chdir(this.Program.getCurrentDirectory());

        try
        {
            if (linter.isPathIgnored(file.fileName) ||
                (this.Config.IgnoreJavaScript && [this.TypeScript.ScriptKind.JS, this.TypeScript.ScriptKind.JSX].includes(scriptKind)) ||
                (this.Config.IgnoreTypeScript && [this.TypeScript.ScriptKind.TS, this.TypeScript.ScriptKind.TSX].includes(scriptKind)))
            {
                this.RunnerLogger?.Log(nameof(this.Run), `No linting: File ${file.fileName} is excluded`);
            }
            else
            {
                let fileName = normalize(file.fileName);
                let lintFileName: string;

                if (
                    fileName.startsWith("^") ||
                    (
                        (
                            fileName.includes("walkThroughSnippet:/") ||
                            fileName.includes("untitled:/")
                        ) &&
                        basename(fileName).startsWith("^")
                    ) ||
                    (fileName.includes(":^") && !fileName.includes(sep)))
                {
                    lintFileName = null;
                }
                else
                {
                    lintFileName = fileName;
                }

                this.RunnerLogger?.Log(nameof(this.Run), "Linting: Start linting…");
                let report = linter.executeOnText(file.getFullText(), ...(lintFileName ? [lintFileName] : []));
                this.RunnerLogger?.Log(nameof(this.Run), "Linting: Ended linting");

                for (let deprecatedRuleUse of report.usedDeprecatedRules)
                {
                    result.push(new DeprecationMessage(this.Plugin, file, deprecatedRuleUse, this.TypeScript.DiagnosticCategory.Warning));
                }

                for (let lintResult of report.results)
                {
                    for (let message of lintResult.messages)
                    {
                        result.push(new ESLintDiagnostic(this.Plugin, file, message));
                    }
                }
            }
        }
        catch (exception)
        {
            let diagnostic: IDiagnostic;
            this.RunnerLogger?.Log(nameof(this.Run), "An error occurred while linting");
            this.RunnerLogger?.Log(nameof(this.Run), exception);

            if (exception instanceof Error)
            {
                this.RunnerLogger?.Log(nameof(this.Run), `Stack trace: ${exception.stack}`);
            }

            if (exception instanceof Error &&
                exception.constructor.name === "ConfigurationNotFoundError")
            {
                diagnostic = new ConfigNotFoundMessage(
                    this.Plugin,
                    file,
                    exception,
                    this.TypeScript.DiagnosticCategory.Warning);
            }
            else
            {
                diagnostic = new DiagnosticMessage(
                    this.Plugin,
                    file,
                    `An error occurred while linting:\n${exception}`,
                    this.TypeScript.DiagnosticCategory.Error
                );
            }

            result.push(diagnostic);
        }

        process.chdir(currentDirectory);
        return result;
    }

    /**
     * Determines the path to the specified {@link packageManager `packageManager`}.
     *
     * @param packageManager
     * The package-manager to get the path of.
     *
     * @returns
     * The path to the global module-directory of the specified {@link PackageManager `PackageManager`}.
     */
    private GetPackageManagerPath(packageManager: PackageManager): string
    {
        this.RunnerLogger?.Log(nameof(this.GetPackageManagerPath), `Trying to resolve the package manager path for ${packageManager}`);

        if (!this.packageManagerPaths.has(packageManager))
        {
            let path: string;

            switch (packageManager)
            {
                case PackageManager.NPM:
                    path = execSync("npm root -g").toString().trim();
                    break;
                case PackageManager.Yarn:
                    path = execSync("yarn global dir").toString().trim();
                    break;
                case PackageManager.PNPM:
                    path = execSync("pnpm root -g").toString().trim();
                    break;
            }

            this.packageManagerPaths.set(packageManager, path);
        }

        this.RunnerLogger?.Log(nameof(this.GetPackageManagerPath), `Found the package manager path for ${packageManager}`);
        return this.packageManagerPaths.get(packageManager);
    }

    /**
     * Loads the {@link CLIEngine `CLIEngine`} for the file with the specified {@link filePath `filePath`}.
     *
     * @param filePath
     * The file to check.
     *
     * @returns
     * A method for loading the {@link CLIEngine `CLIEngine`}.
     */
    // eslint-disable-next-line deprecation/deprecation
    private LoadLibrary(filePath: string): () => eslint.CLIEngine
    {
        this.RunnerLogger?.Log(nameof(this.LoadLibrary), `Trying to load 'eslint' for '${filePath}'`);

        /**
         * Resolves the global module-directory.
         *
         * @returns
         * The path to the global module-directory.
         */
        let getGlobalPath = (): string => this.GetPackageManagerPath(this.Config.PackageManager);
        let directory = dirname(filePath);
        let esLintPath: string;

        try
        {
            esLintPath = this.ResolveESLint(undefined, directory);

            if (esLintPath.length === 0)
            {
                esLintPath = this.ResolveESLint(getGlobalPath(), directory);
            }
        }
        catch
        {
            esLintPath = this.ResolveESLint(getGlobalPath(), directory);
        }

        if (esLintPath.length === 0)
        {
            this.RunnerLogger?.Log(nameof(this.LoadLibrary), "The `eslint` module could not be found!");
            return () => null;
        }
        else
        {
            this.RunnerLogger?.Log(nameof(this.LoadLibrary), `Resolves 'eslint' to '${esLintPath}'`, LogLevel.Verbose);

            // eslint-disable-next-line deprecation/deprecation
            return (): eslint.CLIEngine =>
            {
                // eslint-disable-next-line deprecation/deprecation
                let linter: eslint.CLIEngine;
                let library: typeof eslint;

                /**
                 * Creates a new {@link eslint.CLIEngine `CLIEngine`}.
                 *
                 * @returns
                 * The newly created {@link eslint.CLIEngine `CLIEngine`}.
                 */
                // eslint-disable-next-line deprecation/deprecation
                let createEngine = (): eslint.CLIEngine =>
                {
                    let currentDirectory = process.cwd();
                    this.RunnerLogger?.Log(nameof(this.LoadLibrary), "Dumping the configuration", LogLevel.Verbose);
                    this.RunnerLogger?.Log(nameof(this.LoadLibrary), this.Config.ToJSON(), LogLevel.Verbose);
                    process.chdir(this.Program.getCurrentDirectory());

                    // eslint-disable-next-line deprecation/deprecation
                    let result = new library.CLIEngine(
                        {
                            cache: true,
                            allowInlineConfig: this.Config.AllowInlineConfig,
                            reportUnusedDisableDirectives: this.Config.ReportUnusedDisableDirectives,
                            useEslintrc: this.Config.UseESLintRC,
                            configFile: this.Config.ConfigFile
                        });

                    process.chdir(currentDirectory);
                    return result;
                };

                try
                {
                    library = require(esLintPath);
                    linter = createEngine();
                }
                catch
                {
                    linter = undefined;
                }

                return linter;
            };
        }
    }

    /**
     * Resolves the path to the `eslint`-library.
     *
     * @param nodePath
     * The path to resolve globally installed modules.
     *
     * @param cwd
     * The directory to resolve `eslint` from.
     *
     * @returns
     * The path to the `eslint`-module.
     */
    private ResolveESLint(nodePath: string, cwd: string): string
    {
        let env = { ...process.env };
        let nodePathKey = "NODE_PATH";

        let app = [
            `
            try
            {
                console.log(require.resolve('eslint'));
            }
            catch
            {
                console.log("");
            }`
        ].join("");

        if (nodePath)
        {
            if (nodePathKey in env)
            {
                env[nodePathKey] = nodePath + delimiter + env[nodePathKey];
            }
            else
            {
                env[nodePathKey] = nodePath;
            }
        }

        env.ELECTRON_RUN_AS_NODE = "1";
        return spawnSync(process.argv0, ["-e", app], { cwd, env }).stdout.toString().trim();
    }
}
