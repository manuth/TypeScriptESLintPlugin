import { TempDirectory } from "@manuth/temp-files";
import { ensureDir, writeJSON } from "fs-extra";
import ts = require("typescript/lib/tsserverlibrary");
import { join, relative } from "upath";
import { DiagnosticIDDecorator } from "../../../Diagnostics/DiagnosticIDDecorator";
import { ITSConfiguration } from "../../../Settings/ITSConfiguration";
import { TestConstants } from "../TestConstants";
import { TSServer } from "../TSServer";
import { DiagnosticsResponseAnalyzer } from "./DiagnosticsResponseAnalyzer";
import { FixResponseAnalyzer } from "./FixResponseAnalyzer";
import { TempWorkspace } from "./TempWorkspace";
import { TestWorkspace } from "./TestWorkspace";

/**
 * Provides functions for testing the plugin.
 */
export class LanguageServiceTester
{
    /**
     * The default instance of the language service tester.
     */
    private static defaultInstance: LanguageServiceTester = null;

    /**
     * The working directory to set for the tsserver.
     */
    private workingDirectory: string;

    /**
     * The typescript-server for testing.
     */
    private tsServer: TSServer = null;

    /**
     * The default workspace for testing.
     */
    private defaultWorkspace: TestWorkspace = null;

    /**
     * A set of temporary workspaces which are attached to this tester.
     */
    private readonly tempWorkspaces: TestWorkspace[] = [];

    /**
     * A component for creating fix-ids.
     */
    private idDecorator: DiagnosticIDDecorator = null;

    /**
     * Initializes a new instance of the `PluginTester` class.
     *
     * @param workingDirectory
     * The working directory to set for the default workspace.
     */
    public constructor(workingDirectory: string)
    {
        this.workingDirectory = workingDirectory;
    }

    /**
     * Gets the default instance.
     */
    public static get Default(): LanguageServiceTester
    {
        if (this.defaultInstance === null)
        {
            this.defaultInstance = new LanguageServiceTester(TestConstants.ProjectDirectory);
        }

        return this.defaultInstance;
    }

    /**
     * Gets the typescript-server for testing.
     */
    public get TSServer(): TSServer
    {
        if (this.tsServer === null)
        {
            this.tsServer = new TSServer(this.workingDirectory);
        }

        return this.tsServer;
    }

    /**
     * Gets the default workspace for testing.
     */
    public get DefaultWorkspace(): TestWorkspace
    {
        if (this.defaultWorkspace === null)
        {
            this.defaultWorkspace = new TestWorkspace(this, this.workingDirectory);
        }

        return this.defaultWorkspace;
    }

    /**
     * Gets a set of temporary workspaces which are attached to this tester.
     */
    public get TempWorkspaces(): readonly TestWorkspace[]
    {
        return this.tempWorkspaces;
    }

    /**
     * Gets a component for creating fix-ids.
     */
    public get IDDecorator(): DiagnosticIDDecorator
    {
        if (this.idDecorator === null)
        {
            this.idDecorator = new DiagnosticIDDecorator();
        }

        return this.idDecorator;
    }

    /**
     * Creates a path relative to the workspace-directory.
     *
     * @param path
     * The path to join.
     *
     * @returns
     * The joined path.
     */
    public MakePath(...path: string[]): string
    {
        return this.DefaultWorkspace.MakePath(...path);
    }

    /**
     * Creates a new temporary workspace.
     *
     * @param eslintRules
     * The eslint-rules to apply.
     *
     * @param pluginConfiguration
     * The plugin-configuration to apply.
     *
     * @param globalTempDir
     * A value indicating whether the global temp-directory should be used.
     *
     * @returns
     * The newly created temporary workspace.
     */
    public async CreateTemporaryWorkspace(eslintRules?: any, pluginConfiguration?: ITSConfiguration, globalTempDir?: boolean): Promise<TestWorkspace>
    {
        await ensureDir(TestConstants.TempWorkspaceDirectory);

        let tempDir = new TempDirectory(
            globalTempDir ?
                {} :
                {
                    Directory: TestConstants.TempWorkspaceDirectory
                });

        await writeJSON(
            tempDir.MakePath(".eslintrc"),
            {
                extends: relative(tempDir.FullName, join(TestConstants.TestDirectory, ".eslintrc.base.js")),
                rules: eslintRules
            });

        await writeJSON(
            tempDir.MakePath("tsconfig.json"),
            {
                extends: relative(tempDir.FullName, join(TestConstants.TestDirectory, "tsconfig.base.json")),
                compilerOptions: {
                    plugins: [
                        {
                            name: TestConstants.Package.Name,
                            ...pluginConfiguration
                        }
                    ]
                }
            });

        let result = new TempWorkspace(this, tempDir);
        this.tempWorkspaces.push(result);
        return result;
    }

    /**
     * Configures the plugin.
     *
     * @param configuration
     * The configuration to apply.
     */
    public async ConfigurePlugin(configuration: ITSConfiguration): Promise<void>
    {
        return this.DefaultWorkspace.ConfigurePlugin(configuration);
    }

    /**
     * Sends a file to the server.
     *
     * @param file
     * The file to send.
     *
     * @param code
     * The content to add to the file.
     *
     * @param scriptKind
     * The type of the file to send.
     */
    public async SendFile(file: string, code: string, scriptKind?: ts.server.protocol.ScriptKindName): Promise<void>
    {
        return this.DefaultWorkspace.SendFile(file, code, scriptKind);
    }

    /**
     * Checks a code for diagnostics.
     *
     * @param code
     * The code to check.
     *
     * @param scriptKind
     * The name of the script-kind to open.
     *
     * @param fileName
     * The name of the file to check.
     *
     * @returns
     * The response of the code-analysis.
     */
    public async AnalyzeCode(code: string, scriptKind?: ts.server.protocol.ScriptKindName, fileName?: string): Promise<DiagnosticsResponseAnalyzer>
    {
        return this.DefaultWorkspace.AnalyzeCode(code, scriptKind, fileName);
    }

    /**
     * Checks a code for fixes.
     *
     * @param code
     * The code to check.
     *
     * @param ruleName
     * The name of the rule to look for fixes.
     *
     * @param scriptKind
     * The name of the script-kind to open.
     *
     * @returns
     * The applicable code-fixes.
     */
    public async GetCodeFixes(code: string, ruleName: string, scriptKind?: ts.server.protocol.ScriptKindName): Promise<FixResponseAnalyzer>
    {
        return this.DefaultWorkspace.GetCodeFixes(code, ruleName, scriptKind);
    }

    /**
     * Disposes the plugin-tester.
     */
    public async Dispose(): Promise<void>
    {
        await this.DefaultWorkspace.Dispose();
        await this.TSServer.Dispose();

        for (let tempWorkspace of this.TempWorkspaces)
        {
            await tempWorkspace.Dispose();
        }
    }
}
