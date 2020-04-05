import ts = require("typescript/lib/tsserverlibrary");
import { DiagnosticIDDecorator } from "../../../Diagnostics/DiagnosticIDDecorator";
import { ITSConfiguration } from "../../../Settings/ITSConfiguration";
import { TSServer } from "../TSServer";
import { TestConstants } from "../TestConstants";
import { DiagnosticsResponseAnalyzer } from "./DiagnosticsResponseAnalyzer";
import { FixResponseAnalyzer } from "./FixResponseAnalyzer";
import { TestWorkspace } from "./TestWorkspace";

/**
 * Provides functions for testing the plugin.
 */
export class LanguageServiceTester
{
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
     * A component for creating fix-ids.
     */
    private idDecorator: DiagnosticIDDecorator = null;

    /**
     * Initializes a new instance of the `PluginTester` class.
     *
     * @param workingDirectory
     * The working directory to set for the default workspace.
     */
    public constructor(workingDirectory: string = TestConstants.ProjectDirectory)
    {
        this.workingDirectory = workingDirectory;
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
     * Gets the typescript-server to test.
     */
    public get TSServer(): TSServer
    {
        return this.DefaultWorkspace.TSServer;
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
     * Configures the plugin.
     *
     * @param configuration
     * The configuration to apply.
     */
    public async Configure(configuration: ITSConfiguration): Promise<void>
    {
        return this.DefaultWorkspace.Configure(configuration);
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
     * @param scriptKindName
     * The name of the script-kind to open.
     *
     * @param fileName
     * The name of the file to check.
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
     * @param scriptKindName
     * The name of the script-kind to open.
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
    }
}
