import { MRUCache } from "@thi.ng/cache";
import ChildProcess = require("child_process");
import eslint = require("eslint");
import { CLIEngine } from "eslint";
import Path = require("path");
import ts = require("typescript/lib/tsserverlibrary");
import server = require("vscode-languageserver");
import { Logger } from "../Logging/Logger";
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
    private static emptyResult: IRunnerResult = {
        report: {
            errorCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            results: [],
            warningCount: 0,
            usedDeprecatedRules: []
        },
        warnings: []
    };

    /**
     * The plugin of this runner.
     */
    private plugin: Plugin;

    /**
     * A set of documents and functions for resolving their `CLIEngine`.
     */
    private document2LibraryCache = new MRUCache<string, () => CLIEngine>([], { maxsize: 100 });

    /**
     * The paths to the package-managers.
     */
    private packageManagerPaths = new Map<PackageManager, string>();

    /**
     * The logger for writing messages.
     */
    private logger: Logger;

    /**
     * Initializes a new instance of the `ESLintRunner` class.
     *
     * @param plugin
     * The plugin of the runner.
     *
     * @param logger
     * The logger for writing messages.
     */
    public constructor(plugin: Plugin, logger: Logger)
    {
        this.plugin = plugin;
        this.logger = logger;
    }

    /**
     * Gets the plugin of the runner.
     */
    public get Plugin(): Plugin
    {
        return this.plugin;
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
     */
    public RunESLint(file: ts.SourceFile): IRunnerResult
    {
        let warnings: string[] = [];
        this.Log("RunESLint", "Starting…");

        if (!this.document2LibraryCache.has(file.fileName))
        {
            this.document2LibraryCache.set(file.fileName, this.LoadLibrary(file.fileName));
        }

        this.Log("RunESLint", "Loaded 'eslint' library");
        let engine = this.document2LibraryCache.get(file.fileName)() as CLIEngine;

        if (!engine)
        {
            return {
                ...ESLintRunner.emptyResult,
                warnings: [
                    this.GetInstallFailureMessage(file.fileName)
                ]
            };
        }

        this.Log("RunESLint", `Validating '${file.fileName}'…`);
        return this.Run(file, engine, warnings);
    }

    /**
     * Logs a message.
     *
     * @param label
     * The label to add.
     *
     * @param message
     * The message to log.
     */
    protected Log(label: string, message: string): void
    {
        this.logger.Info(`(${label}) ${message}`);
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
     * @param warnings
     * An object for storing warnings.
     */
    protected Run(file: ts.SourceFile, engine: CLIEngine, warnings: string[]): IRunnerResult
    {
        let result: eslint.CLIEngine.LintReport;
        let currentDirectory = process.cwd();
        let scriptKind = this.LanguageServiceHost.getScriptKind(file.fileName);
        this.Log("Run", `Starting validation for ${file.fileName}…`);
        this.Log("Run", "Detecting the ScriptKind of the file…");
        this.Log("Run", `${file.fileName} is a ${ts.ScriptKind[this.LanguageServiceHost.getScriptKind(file.fileName)]}-file`);
        this.Log("Run", "Printing the configuration for the file…");
        this.Log("Run", `${JSON.stringify(this.Config)}`);
        process.chdir(this.Program.getCurrentDirectory());

        if (engine.isPathIgnored(file.fileName) ||
            (this.Config.IgnoreJavaScript && [ts.ScriptKind.JS, ts.ScriptKind.JSX].includes(this.LanguageServiceHost.getScriptKind(file.fileName))))
        {
            this.Log("Run", `No linting: File ${file.fileName} is excluded`);
            return ESLintRunner.emptyResult;
        }

        try
        {
            this.Log("Run", "Linting: Start linting…");
            result = engine.executeOnText(file.getFullText(), file.fileName);
            this.Log("Run", "Linting: Ended linting");
        }
        catch (exception)
        {
            this.Log("Run", "An error occurred while linting");
            this.Log("Run", exception);

            if (exception instanceof Error)
            {
                warnings.push(exception.message);
            }
        }

        process.chdir(currentDirectory);

        return {
            report: result,
            warnings
        };
    }

    /**
     * Processes an error which reminds the user to install `eslint`.
     *
     * @param filePath
     * The path to the file to process an error for.
     *
     * @param config
     * The configuration to use.
     */
    private GetInstallFailureMessage(filePath: string): string
    {
        let config = this.Config;

        let localCommands = {
            [PackageManager.NPM]: "npm install tslint",
            [PackageManager.PNPM]: "pnpm install tslint",
            [PackageManager.Yarn]: "yarn add tslint"
        };

        let globalCommands = {
            [PackageManager.NPM]: "npm install -g tslint",
            [PackageManager.PNPM]: "pnpm install -g tslint",
            [PackageManager.Yarn]: "yarn global add tslint"
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
     */
    private GetPackageManagerPath(packageManager: PackageManager): string
    {
        this.Log("GetPackageManagerPath", `Trying to resolve the package manager path for ${packageManager}`);

        if (!this.packageManagerPaths.has(packageManager))
        {
            let path: string;

            switch (packageManager)
            {
                case PackageManager.NPM:
                    path = server.Files.resolveGlobalNodePath((message) => this.logger.Info(message));
                    break;
                case PackageManager.Yarn:
                    path = server.Files.resolveGlobalYarnPath((message) => this.logger.Info(message));
                    break;
                case PackageManager.PNPM:
                    path = ChildProcess.execSync("pnpm root -g").toString().trim();
                    break;
            }

            this.packageManagerPaths.set(packageManager, path);
        }

        this.Log("GetPackageManagerPath", `Found the package manager path for ${packageManager}`);
        return this.packageManagerPaths.get(packageManager);
    }

    /**
     * Loads the `CLIEngine` for the file with the specified `filePath`.
     *
     * @param filePath
     * The file to check.
     *
     * @param warnings
     * An object for storing warnings.
     */
    private LoadLibrary(filePath: string): () => CLIEngine
    {
        this.Log("LoadLibrary", `Trying to load 'eslint' for '${filePath}'`);
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

        this.Log("LoadLibrary", `Resolves 'eslint' to '${esLintPath}'`);

        return (): CLIEngine =>
        {
            let library: typeof eslint;
            let engine: eslint.CLIEngine;

            let createEngine = (): eslint.CLIEngine =>
            {
                this.Log("LoadLibrary", JSON.stringify(this.Config));

                return new library.CLIEngine(
                    {
                        cache: true,
                        ignorePattern: this.Config.Exclude,
                        allowInlineConfig: this.Config.AllowInlineConfig,
                        reportUnusedDisableDirectives: this.Config.ReportUnusedDisableDirectives,
                        useEslintrc: this.Config.UseESLintRC
                    });
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

    /**
     * Resolves the path to the `eslint`-library.
     *
     * @param nodePath
     * The global path to resolve modules.
     *
     * @param cwd
     * The directory to resolve `eslint` from.
     */
    private ResolveESLint(nodePath: string, cwd: string): string
    {
        let env = { ...process.env };
        let nodePathKey = "NODE_PATH";
        let app = [
            "console.log(require.resolve('eslint'));"
        ].join("");

        if (nodePathKey in env)
        {
            env[nodePathKey] = nodePathKey + Path.delimiter + env[nodePathKey];
        }
        else
        {
            env[nodePathKey] = nodePath;
        }

        env.ELECTRON_RUN_AS_NODE = "1";
        return ChildProcess.spawnSync(process.argv0, ["-e", app], { cwd, env }).stdout.toString().trim();
    }
}
