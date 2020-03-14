import isEqual = require("lodash.isequal");

/**
 * Provides the functionality to analyze a fix-response.
 */
export class FixResponseAnalyzer
{
    /**
     * The response to analyze.
     */
    private fixResponse: ts.server.protocol.GetCodeFixesResponse;

    /**
     * Initializes a new instance of the `FixResponseAnalyzer` class.
     *
     * @param fixResponse
     * The response to analyze.
     */
    public constructor(fixResponse: ts.server.protocol.GetCodeFixesResponse)
    {
        this.fixResponse = fixResponse;
    }

    /**
     * Gets the response to analyze.
     */
    public get FixResponse(): ts.server.protocol.GetCodeFixesResponse
    {
        return this.fixResponse;
    }

    /**
     * Gets the fixes.
     */
    public get Fixes(): Array<ts.server.protocol.CodeAction | ts.server.protocol.CodeFixAction>
    {
        return this.FixResponse.body;
    }

    /**
     * Filters the fixes with the specified name.
     *
     * @param fixName
     * The name of the fix to get.
     */
    public Filter(fixName: string): ts.server.protocol.CodeFixAction[]
    {
        return this.Fixes.filter(
            (codeAction) =>
            {
                if ("fixName" in codeAction)
                {
                    return codeAction.fixName === fixName;
                }
                else
                {
                    return false;
                }
            }) as ts.server.protocol.CodeFixAction[];
    }

    /**
     * Gets a value indicating whether a combined fix with the specified id exists.
     *
     * @param fixId
     * The id of the combinded fix.
     */
    public HasCombinedFix(fixId: {}): boolean
    {
        return this.Fixes.some(
            (codeAction) =>
            {
                if ("fixId" in codeAction)
                {
                    return isEqual(codeAction.fixId, fixId);
                }
                else
                {
                    return false;
                }
            });
    }
}
