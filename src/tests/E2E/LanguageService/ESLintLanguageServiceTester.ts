import { TempDirectory } from "@manuth/temp-files";
import { LanguageServiceTester, TSServer } from "@manuth/typescript-languageservice-tester";
import { ensureDirSync } from "fs-extra";
import { Constants } from "../../../Constants";
import { DiagnosticIDDecorator } from "../../../Diagnostics/DiagnosticIDDecorator";
import { ITSConfiguration } from "../../../Settings/ITSConfiguration";
import { MyTSServer } from "../MyTSServer";
import { TestConstants } from "../TestConstants";
import { ESLintDiagnosticResponse } from "./ESLintDiagnosticResponse";
import { ESLintWorkspace } from "./ESLintWorkspace";

/**
 * Provides functions for testing the plugin.
 */
export class ESLintLanguageServiceTester extends LanguageServiceTester
{
    /**
     * The default instance of the language service tester.
     */
    private static defaultInstance: ESLintLanguageServiceTester = null;

    /**
     * The typescript-server.
     */
    private myTSServer: MyTSServer = null;

    /**
     * A component for creating fix-ids.
     */
    private idDecorator: DiagnosticIDDecorator = null;

    /**
     * Initializes a new instance of the `ESLintLanguageServiceTester` class.
     *
     * @param workingDirectory
     * The working directory to set for the default workspace.
     */
    public constructor(workingDirectory: string)
    {
        super(workingDirectory);
    }

    /**
     * Gets the default instance.
     */
    public static get Default(): ESLintLanguageServiceTester
    {
        if (this.defaultInstance === null)
        {
            ensureDirSync(TestConstants.MainTestWorkspaceDirectory);
            this.defaultInstance = new ESLintLanguageServiceTester(TestConstants.MainTestWorkspaceDirectory);
        }

        return this.defaultInstance;
    }

    /**
     * @inheritdoc
     */
    public get TSServer(): TSServer
    {
        if (this.myTSServer === null)
        {
            this.myTSServer = new MyTSServer(this.WorkingDirectory);
        }

        return this.myTSServer;
    }

    /**
     * @inheritdoc
     */
    public get ErrorCodes(): number[]
    {
        return [
            Constants.ErrorCode
        ];
    }

    /**
     * Gets the default workspace for testing.
     */
    public get DefaultWorkspace(): ESLintWorkspace
    {
        return super.DefaultWorkspace as ESLintWorkspace;
    }

    /**
     * Gets a set of temporary workspaces which are attached to this tester.
     */
    public get TempWorkspaces(): readonly ESLintWorkspace[]
    {
        return super.TempWorkspaces as readonly ESLintWorkspace[];
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
    public async CreateTemporaryWorkspace(eslintRules?: Record<string, unknown>, pluginConfiguration?: ITSConfiguration, globalTempDir?: boolean): Promise<ESLintWorkspace>
    {
        let workspace: ESLintWorkspace;

        if (globalTempDir)
        {
            workspace = await super.CreateTemporaryWorkspace() as ESLintWorkspace;
        }
        else
        {
            workspace = this.CreateWorkspace(
                new TempDirectory(
                    {
                        Directory: TestConstants.TempWorkspaceDirectory
                    }).FullName);
        }

        await workspace.Configure(eslintRules, pluginConfiguration);
        return workspace;
    }

    /**
     * Writes the configuration of the default workspace.
     *
     * @param eslintRules
     * The eslint-rules to apply.
     *
     * @param pluginConfiguration
     * The plugin-configuration to apply.
     */
    public async Configure(eslintRules?: Record<string, unknown>, pluginConfiguration?: ITSConfiguration): Promise<void>
    {
        return this.DefaultWorkspace.Configure(eslintRules, pluginConfiguration);
    }

    /**
     * @inheritdoc
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
    public async AnalyzeCode(code: string, scriptKind?: ts.server.protocol.ScriptKindName, fileName?: string): Promise<ESLintDiagnosticResponse>
    {
        return this.DefaultWorkspace.AnalyzeCode(code, scriptKind, fileName);
    }

    /**
     * @inheritdoc
     *
     * @param workspacePath
     * The path to the workspace to create.
     *
     * @returns
     * The newly created workspace.
     */
    protected CreateWorkspace(workspacePath: string): ESLintWorkspace
    {
        return new ESLintWorkspace(this, workspacePath);
    }
}
