import ChildProcess = require("child_process");
import Path = require("path");
import { MRUCache } from "@thi.ng/cache";
import eslint = require("eslint");
import ts = require("typescript/lib/tsserverlibrary");
import { basename, normalize, sep } from "upath";
import server = require("vscode-languageserver");
import { ConfigNotFoundMessage } from "../Diagnostics/ConfigNotFoundMessage";
import { ESLintNotInstalledMessage } from "../Diagnostics/ESLintNotInstalledMessage";
import { IMessage } from "../Diagnostics/IMessage";
import { LoggerBase } from "../Logging/LoggerBase";
import { LogLevel } from "../Logging/LogLevel";
import { RunnerLogger } from "../Logging/RunnerLogger";
import { Plugin } from "../Plugin";
import { Configuration } from "../Settings/Configuration";
import { PackageManager } from "../Settings/PackageManager";
import { IRunnerResult } from "./IRunnerResult";

/**
 * Provides the functionality to run ESLint.
 */
export class ESLintRunner
{
    /**
     * An empty result.
     */
    private static get EmptyResult(): IRunnerResult
    {
        return {
            Report: {
                errorCount: 0,
                fixableErrorCount: 0,
                fixableWarningCount: 0,
                results: [],
                warningCount: 0,
                usedDeprecatedRules: []
            },
            Messages: []
        };
    }

    /**
     * The plugin of this runner.
     */
    private plugin: Plugin;

    /**
     * A set of documents and functions for resolving their `CLIEngine`.
     */
    private document2LibraryCache = new MRUCache<string, () => eslint.CLIEngine>([], { maxsize: 100 });

    /**
     * The paths to the package-managers.
     */
    private packageManagerPaths = new Map<PackageManager, string>();

    /**
     * Initializes a new instance of the `ESLintRunner` class.
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
    public get RunnerLogger(): RunnerLogger
    {
        if (this.Config.LogLevel !== LogLevel.None)
        {
            return new RunnerLogger(this.RealLogger);
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
    public RunESLint(file: ts.SourceFile): IRunnerResult
    {
        let messages: IMessage[] = [];
        let result: IRunnerResult;
        this.RunnerLogger?.Log("RunESLint", "Starting…");

        if (!this.document2LibraryCache.has(file.fileName))
        {
            try
            {
                this.document2LibraryCache.set(file.fileName, this.LoadLibrary(file.fileName));
            }
            catch
            { }
        }

        this.RunnerLogger?.Log("RunESLint", "Loaded 'eslint' library");
        let engine = this.document2LibraryCache.get(file.fileName)?.() as eslint.CLIEngine;

        if (!engine)
        {
            result = null;

            messages.push(
                new ESLintNotInstalledMessage(
                    this.GetInstallFailureMessage(file.fileName),
                    this.TypeScript.DiagnosticCategory.Warning));
        }
        else
        {
            this.RunnerLogger?.Log("RunESLint", `Validating '${file.fileName}'…`);
            result = this.Run(file, engine);
        }

        return {
            ...ESLintRunner.EmptyResult,
            ...result,
            Messages: [
                ...(result?.Messages ?? []),
                ...messages
            ]
        };
    }

    /**
     * Checks a file using `eslint`.
     *
     * @param file
     * The file to check.
     *
     * @param engine
     * The `eslint`-engine.
     *
     * @returns
     * The result of the lint.
     */
    protected Run(file: ts.SourceFile, engine: eslint.CLIEngine): IRunnerResult
    {
        let result = ESLintRunner.EmptyResult;
        let currentDirectory = process.cwd();
        let scriptKind = this.LanguageServiceHost.getScriptKind(file.fileName);
        this.RunnerLogger?.Log("Run", `Starting validation for ${file.fileName}…`);
        this.RunnerLogger?.Log("Run", "Detecting the ScriptKind of the file…");
        this.RunnerLogger?.Log("Run", `${file.fileName} is a ${this.TypeScript.ScriptKind[this.LanguageServiceHost.getScriptKind(file.fileName)]}-file`);
        this.RunnerLogger?.Log("Run", "Printing the configuration for the file…");
        this.RunnerLogger?.Log("Run", this.Config.ToJSON());
        process.chdir(this.Program.getCurrentDirectory());

        try
        {
            if (engine.isPathIgnored(file.fileName) ||
                (this.Config.IgnoreJavaScript && [this.TypeScript.ScriptKind.JS, this.TypeScript.ScriptKind.JSX].includes(scriptKind)) ||
                (this.Config.IgnoreTypeScript && [this.TypeScript.ScriptKind.TS, this.TypeScript.ScriptKind.TSX].includes(scriptKind)))
            {
                this.RunnerLogger?.Log("Run", `No linting: File ${file.fileName} is excluded`);
            }
            else
            {
                /**
                 * ToDo: Replace with new TypeScript-version.
                 */
                let args: [] | [string];
                let fileName = normalize(file.fileName);

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
                    args = [];
                }
                else
                {
                    args = [file.fileName];
                }

                this.RunnerLogger?.Log("Run", "Linting: Start linting…");
                result.Report = engine.executeOnText(file.getFullText(), ...args);
                this.RunnerLogger?.Log("Run", "Linting: Ended linting");
            }
        }
        catch (exception)
        {
            let message: IMessage;
            this.RunnerLogger?.Log("Run", "An error occurred while linting");
            this.RunnerLogger?.Log("Run", exception);

            if (exception instanceof Error)
            {
                this.RunnerLogger?.Log("Run", `Stack trace: ${exception.stack}`);

                if (exception.constructor.name === "ConfigurationNotFoundError")
                {
                    message = new ConfigNotFoundMessage(exception, this.TypeScript.DiagnosticCategory.Warning);
                }
            }
            else
            {
                message = {
                    Category: this.TypeScript.DiagnosticCategory.Error,
                    Text: `An error occurred while linting:\n${exception}`
                };
            }

            result.Messages.push(message);
        }

        process.chdir(currentDirectory);
        return result;
    }

    /**
     * Processes an error which reminds the user to install `eslint`.
     *
     * @param filePath
     * The path to the file to process an error for.
     *
     * @returns
     * The text for the error-message.
     */
    private GetInstallFailureMessage(filePath: string): string
    {
        let config = this.Config;

        let localCommands = {
            [PackageManager.NPM]: "npm install eslint",
            [PackageManager.PNPM]: "pnpm install eslint",
            [PackageManager.Yarn]: "yarn add eslint"
        };

        let globalCommands = {
            [PackageManager.NPM]: "npm install -g eslint",
            [PackageManager.PNPM]: "pnpm install -g eslint",
            [PackageManager.Yarn]: "yarn global add eslint"
        };

        return [
            `Failed to load the ESLint library for '${filePath}'`,
            `To use ESLint, please install eslint using '${localCommands[config.PackageManager]}' or globally using '${globalCommands[this.Config.PackageManager]}'.`,
            "Be sure to restart your editor after installing eslint."
        ].join("\n");
    }

    /**
     * Determines the path to the specified `packageManager`.
     *
     * @param packageManager
     * The package-manager to get the path.
     *
     * @returns
     * The path to the global module-directory of the specified `PackageManager`.
     */
    private GetPackageManagerPath(packageManager: PackageManager): string
    {
        this.RunnerLogger?.Log("GetPackageManagerPath", `Trying to resolve the package manager path for ${packageManager}`);

        if (!this.packageManagerPaths.has(packageManager))
        {
            let path: string;

            switch (packageManager)
            {
                case PackageManager.NPM:
                    path = ChildProcess.execSync("npm root -g").toString().trim();
                    break;
                case PackageManager.Yarn:
                    path = server.Files.resolveGlobalYarnPath((message) => this.Logger?.Info(message));
                    break;
                case PackageManager.PNPM:
                    path = ChildProcess.execSync("pnpm root -g").toString().trim();
                    break;
            }

            this.packageManagerPaths.set(packageManager, path);
        }

        this.RunnerLogger?.Log("GetPackageManagerPath", `Found the package manager path for ${packageManager}`);
        return this.packageManagerPaths.get(packageManager);
    }

    /**
     * Loads the `CLIEngine` for the file with the specified `filePath`.
     *
     * @param filePath
     * The file to check.
     *
     * @returns
     * A method for loading the `CLIEngine`.
     */
    private LoadLibrary(filePath: string): () => eslint.CLIEngine
    {
        this.RunnerLogger?.Log("LoadLibrary", `Trying to load 'eslint' for '${filePath}'`);

        /**
         * Resolves the global module-directory.
         *
         * @returns
         * The path to the global module-directory.
         */
        let getGlobalPath = (): string => this.GetPackageManagerPath(this.Config.PackageManager);
        let directory = Path.dirname(filePath);
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
            throw new Error("'eslint' not found.");
        }
        else
        {
            this.RunnerLogger?.Log("LoadLibrary", `Resolves 'eslint' to '${esLintPath}'`);

            return (): eslint.CLIEngine =>
            {
                let library: typeof eslint;
                let engine: eslint.CLIEngine;

                /**
                 * Creates a new `CLIEngine`.
                 *
                 * @returns
                 * The newly created `CLIEngine`.
                 */
                let createEngine = (): eslint.CLIEngine =>
                {
                    let currentDirectory = process.cwd();
                    this.RunnerLogger?.Log("LoadLibrary", this.Config.ToJSON());
                    process.chdir(this.Program.getCurrentDirectory());

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
                    engine = createEngine();
                }
                catch
                {
                    engine = undefined;
                }

                return engine;
            };
        }
    }

    /**
     * Resolves the path to the `eslint`-library.
     *
     * @param nodePath
     * The global path to resolve modules.
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
                env[nodePathKey] = nodePath + Path.delimiter + env[nodePathKey];
            }
            else
            {
                env[nodePathKey] = nodePath;
            }
        }

        env.ELECTRON_RUN_AS_NODE = "1";
        return ChildProcess.spawnSync(process.argv0, ["-e", app], { cwd, env }).stdout.toString().trim();
    }
}
