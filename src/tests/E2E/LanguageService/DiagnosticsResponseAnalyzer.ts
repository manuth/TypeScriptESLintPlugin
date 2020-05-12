import ts = require("typescript/lib/tsserverlibrary");
import { Constants } from "../../../Constants";

/**
 * Provides the functionality to analyze a diagnostic-response.
 */
export class DiagnosticsResponseAnalyzer
{
    /**
     * The response to analyze.
     */
    private diagnosticsResponse: ts.server.protocol.SemanticDiagnosticsSyncResponse;

    /**
     * Initializes a new instance of the `DiagnosticsResponseAnalyzer` class.
     *
     * @param diagnostsResponse
     * The response to analyze.
     */
    public constructor(diagnostsResponse: ts.server.protocol.SemanticDiagnosticsSyncResponse)
    {
        this.diagnosticsResponse = diagnostsResponse;
    }

    /**
     * Gets the response to analyze.
     */
    public get DiagnosticsResponse(): ts.server.protocol.SemanticDiagnosticsSyncResponse
    {
        return this.diagnosticsResponse;
    }

    /**
     * Gets the diagnostics.
     */
    public get Diagnostics(): Array<ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition>
    {
        return this.DiagnosticsResponse.body;
    }

    /**
     * Looks for the specified rules in the diagnostics.
     *
     * @param ruleName
     * The rule to look for.
     *
     * @returns
     * The diagnostics for the specified `ruleName`.
     */
    public Filter(ruleName: string): ts.server.protocol.Diagnostic[]
    {
        return this.Diagnostics.filter(
            (diagnostic) =>
            {
                if ("text" in diagnostic)
                {
                    return (diagnostic.source === Constants.ErrorSource) && diagnostic.text.endsWith(`(${ruleName})`);
                }
                else
                {
                    return false;
                }
            }) as ts.server.protocol.Diagnostic[];
    }
}
