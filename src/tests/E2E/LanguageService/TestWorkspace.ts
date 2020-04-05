import Assert = require("assert");
import { ensureFile } from "fs-extra";
import ts = require("typescript/lib/tsserverlibrary");
import { Constants } from "../../../Constants";
import { ITSConfiguration } from "../../../Settings/ITSConfiguration";
import { TSServer } from "../TSServer";
import { DiagnosticsResponseAnalyzer } from "./DiagnosticsResponseAnalyzer";
import { FixResponseAnalyzer } from "./FixResponseAnalyzer";

/**
 * Represents a workspace for testing purposes.
 */
export class TestWorkspace
{
    /**
     * The typescript-server for testing.
     */
    private readonly tsServer: TSServer = null;

    /**
     * Initializes a new instance of the `TestWorkspace` class.
     *
     * @param path
     * The path to the directory of the workspace.
     */
    public constructor(path: string)
    {
        this.tsServer = new TSServer(path);
    }

    /**
     * Gets the typescript-server to test.
     */
    public get TSServer(): TSServer
    {
        return this.tsServer;
    }

    /**
     * Configures the plugin.
     *
     * @param configuration
     * The configuration to apply.
     */
    public async Configure(configuration: ITSConfiguration): Promise<void>
    {
        await this.TSServer.Send<ts.server.protocol.ConfigurePluginRequest>(
            {
                type: "request",
                command: ts.server.protocol.CommandTypes.ConfigurePlugin,
                arguments: {
                    pluginName: "typescript-eslint-plugin",
                    configuration
                }
            },
            true);
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
        await this.TSServer.Send<ts.server.protocol.OpenRequest>(
            {
                type: "request",
                command: ts.server.protocol.CommandTypes.Open,
                arguments: {
                    file,
                    fileContent: code,
                    scriptKindName: scriptKind ?? "TS"
                }
            },
            false);
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
        let file = fileName ?? this.GetTestFileName(scriptKind);
        await ensureFile(file);
        await this.SendFile(file, code, scriptKind);

        return new DiagnosticsResponseAnalyzer(
            await this.TSServer.Send<ts.server.protocol.SemanticDiagnosticsSyncRequest>(
                {
                    type: "request",
                    command: ts.server.protocol.CommandTypes.SemanticDiagnosticsSync,
                    arguments: {
                        file,
                        includeLinePosition: false
                    }
                },
                true));
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
        let diagnostics = (await this.AnalyzeCode(code, scriptKind)).Filter(ruleName);
        Assert.ok(diagnostics.length > 0);
        let diagnostic = diagnostics[0];

        return new FixResponseAnalyzer(
            await this.TSServer.Send<ts.server.protocol.CodeFixRequest>(
                {
                    type: "request",
                    command: ts.server.protocol.CommandTypes.GetCodeFixes,
                    arguments: {
                        file: this.GetTestFileName(scriptKind),
                        startLine: diagnostic.start.line,
                        startOffset: diagnostic.start.offset,
                        endLine: diagnostic.end.line,
                        endOffset: diagnostic.end.offset,
                        errorCodes: [Constants.ErrorCode]
                    }
                },
                true));
    }

    /**
     * Disposes the test-workspace.
     */
    public async Dispose(): Promise<void>
    {
        await this.tsServer.Dispose();
    }

    /**
     * Gets a filename of a script for the specified script-kind to test.
     *
     * @param scriptKind
     * The name of the script-kind to get a file for.
     */
    protected GetTestFileName(scriptKind: ts.server.protocol.ScriptKindName): string
    {
        let fileName: string;

        switch (scriptKind)
        {
            case "JSX":
                fileName = "javascript-react.jsx";
                break;
            case "JS":
                fileName = "javascript.js";
                break;
            case "TSX":
                fileName = "typescript-react.tsx";
                break;
            case "TS":
            default:
                fileName = "typescript.ts";
                break;
        }

        return this.TSServer.MakePath("src", fileName);
    }
}
