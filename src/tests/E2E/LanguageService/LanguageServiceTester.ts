import Assert = require("assert");
import ts = require("typescript/lib/tsserverlibrary");
import { Constants } from "../../../Constants";
import { DiagnosticIDDecorator } from "../../../Diagnostics/DiagnosticIDDecorator";
import { ITSConfiguration } from "../../../Settings/ITSConfiguration";
import { TSServer } from "../TSServer";
import { TestConstants } from "../TestConstants";
import { DiagnosticsResponseAnalyzer } from "./DiagnosticsResponseAnalyzer";
import { FixResponseAnalyzer } from "./FixResponseAnalyzer";

/**
 * Provides functions for testing the plugin.
 */
export class LanguageServiceTester
{
    /**
     * The typescript-server to test.
     */
    private tsServer: TSServer;

    /**
     * A component for creating fix-ids.
     */
    private idDecorator: DiagnosticIDDecorator;

    /**
     * Initializes a new instance of the `PluginTester` class.
     */
    public constructor()
    {
        this.tsServer = new TSServer(TestConstants.ProjectDirectory);
        this.idDecorator = new DiagnosticIDDecorator();
    }

    /**
     * Gets the typescript-server to test.
     */
    public get TSServer(): TSServer
    {
        return this.tsServer;
    }

    /**
     * Gets a component for creating fix-ids.
     */
    public get IDDecorator(): DiagnosticIDDecorator
    {
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
     * Sends a file to the server..
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
     * Gets a filename of a script for the specified script-kind to test.
     *
     * @param scriptKind
     * The name of the script-kind to get a file for.
     */
    public GetTestFileName(scriptKind: ts.server.protocol.ScriptKindName): string
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

    /**
     * Checks a code for diagnostics.
     *
     * @param code
     * The code to check.
     *
     * @param scriptKindName
     * The name of the script-kind to open.
     */
    public async AnalyzeCode(code: string, scriptKind?: ts.server.protocol.ScriptKindName): Promise<DiagnosticsResponseAnalyzer>
    {
        let file = this.GetTestFileName(scriptKind);
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
     * Disposes the plugin-tester.
     */
    public async Dispose(): Promise<void>
    {
        await this.tsServer.Dispose();
    }
}
