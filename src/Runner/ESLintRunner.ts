import { MRUCache } from "@thi.ng/cache";
import ChildProcess = require("child_process");
import eslint = require("eslint");
import { CLIEngine } from "eslint";
import Path = require("path");
import Utilities = require("util");
import server = require("vscode-languageserver");
import { Logger } from "../Logging/Logger";
import { Configuration } from "../Settings/Configuration";
import { PackageManager } from "../Settings/PackageManager";
import { ConfigCache } from "./ConfigCache";
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
        result: {
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
     * A set of `eslint`-paths and their `CLIEngine`.
     */
    private eslintPath2Library = new Map<string, CLIEngine>();

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
     * A component for caching configurations.
     */
    private configCache = new ConfigCache();

    /**
     * Initializes a new instance of the `ESLintRunner` class.
     *
     * @param logger
     * The logger for writing messages.
     */
    public constructor(logger: Logger)
    {
        this.logger = logger;
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
    private static GetInstallFailureMessage(filePath: string, config: Configuration): string
    {
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
            `To use ESLint, please install eslint using '${localCommands[config.PackageManager]}' or globally using '${globalCommands[config.PackageManager]}'.`,
            "Be sure to restart your editor after installing eslint."
        ].join("\n");
    }

    /**
     * Checks a file using `eslint`.
     *
     * @param program
     * The program which is being checked.
     *
     * @param filePath
     * The path to the file to check.
     *
     * @param config
     * The configuration to apply.
     */
    public RunESLint(program: ts.Program, filePath: string, config: Configuration): IRunnerResult
    {
        let warnings: string[] = [];
        this.Log("RunESLint", "Starting…");
        Array.from<(number), number>(
            [],
            () => null);

        if (!this.document2LibraryCache.has(filePath))
        {
            this.LoadLibrary(filePath, config);
        }

        this.Log("RunESLint", "Loaded 'eslint' library");

        let engine = this.document2LibraryCache.get(filePath)() as CLIEngine;

        if (!engine)
        {
            return {
                ...ESLintRunner.emptyResult,
                warnings: [
                    ESLintRunner.GetInstallFailureMessage(filePath, config)
                ]
            };
        }

        this.Log("RunESLint", `Validating '${filePath}'…`);
        return this.Run(program, filePath, engine, config, warnings);
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
     * @param program
     * The program which is being checked.
     *
     * @param filePath
     * The path to the file to check.
     *
     * @param engine
     * The `eslint`-engine.
     *
     * @param config
     * The configuration to apply.
     *
     * @param warnings
     * An object for storing warnings.
     */
    protected Run(program: ts.Program, filePath: string, engine: CLIEngine, config: Configuration, warnings: string[]): IRunnerResult
    {
        let linterConfig: eslint.Linter.Config;
        let result: eslint.CLIEngine.LintReport;
        let currentDirectory = process.cwd();
        this.Log("Run", `Starting validation for ${filePath}…`);
        process.chdir(program.getCurrentDirectory());

        if (engine.isPathIgnored(filePath))
        {
            this.Log("Run", `No linting: File ${filePath} is excluded`);
            return ESLintRunner.emptyResult;
        }

        try
        {
            linterConfig = this.GetConfiguration(filePath, filePath, engine);
        }
        catch (exception)
        {
            let message = `Unknown Error: ${exception}`;

            if (exception instanceof Error)
            {
                this.Log("Run", `No linting: Exception while getting eslint configuration for '${filePath}'`);
                message = exception.message;
            }

            warnings.push(`Cannot read eslint configuration - ${message}`);

            return {
                result,
                warnings
            };
        }

        this.Log("Run", "Configuration fetched");

        // ToDo maybe set some linter-options
        this.logger.Verbose(Utilities.inspect(linterConfig));

        try
        {
            this.Log("Run", "Linting: Start linting…");
            result = engine.executeOnFiles([filePath]);
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

        // ToDo return result
        return {
            result,
            warnings
        };
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
     * @param config
     * The configuration to apply.
     *
     * @param warnings
     * An object for storing warnings.
     */
    private LoadLibrary(filePath: string, config: Configuration): void
    {
        this.Log("LoadLibrary", `Trying to load 'eslint' for '${filePath}'`);
        let getGlobalPath = (): string => this.GetPackageManagerPath(config.PackageManager);
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

        this.document2LibraryCache.set(
            filePath,
            () =>
            {
                let library: typeof eslint;

                if (!this.eslintPath2Library.has(esLintPath))
                {
                    try
                    {
                        library = require(esLintPath);
                    }
                    catch
                    {
                        library = undefined;
                    }

                    this.eslintPath2Library.set(esLintPath, new library.CLIEngine({}));
                }

                return this.eslintPath2Library.get(esLintPath);
            });
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

    /**
     * Retrieves the configuration for the specified file.
     *
     * @param uri
     * The uri to the file to get the configuration for.
     *
     * @param filePath
     * The path to the file to get the configuration for.
     *
     * @param engine
     * The `eslint`-engine.
     */
    private GetConfiguration(uri: string, filePath: string, engine: CLIEngine): eslint.Linter.Config
    {
        this.Log("GetConfiguration", `Retrieving the configuration for '${uri}`);
        let config = this.configCache.Get(filePath);

        if (config)
        {
            return config;
        }

        config = engine.getConfigForFile(filePath);
        this.configCache.Set(filePath, config);
        return this.configCache.Configuration;
    }
}