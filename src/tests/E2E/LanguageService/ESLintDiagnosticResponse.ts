import { Diagnostic, DiagnosticsResponseAnalyzer, ICodeAnalysisResult, TestWorkspace } from "@manuth/typescript-languageservice-tester";
import { Constants } from "../../../Constants";

/**
 * Provides the functionality to analyze a diagnostic-response.
 */
export class ESLintDiagnosticResponse extends DiagnosticsResponseAnalyzer
{
    /**
     * Initializes a new instance of the {@link ESLintDiagnosticResponse `ESLintDiagnosticResponse`} class.
     *
     * @param codeAnalysisResult
     * The response to analyze.
     *
     * @param workspace
     * The workspace of the response.
     *
     * @param scriptKind
     * The script-kind of the file of the response.
     *
     * @param fileName
     * The name of the file of the response.
     */
    public constructor(codeAnalysisResult: ICodeAnalysisResult, workspace: TestWorkspace, scriptKind: ts.server.protocol.ScriptKindName, fileName: string)
    {
        super(codeAnalysisResult, workspace, scriptKind, fileName);
    }

    /**
     * Looks for the specified rules in the diagnostics.
     *
     * @param ruleName
     * The rule to look for.
     *
     * @returns
     * The diagnostics for the specified {@link ruleName `ruleName`}.
     */
    public FilterRule(ruleName: string): Diagnostic[]
    {
        return this.Diagnostics.filter(
            (diagnostic) =>
            {
                return (diagnostic.Source === Constants.ErrorSource) &&
                    diagnostic.Message.endsWith(`(${ruleName})`);
            });
    }
}
