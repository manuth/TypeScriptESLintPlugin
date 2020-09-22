import { Linter } from "eslint";
import ts = require("typescript/lib/tsserverlibrary");
import { Range } from "vscode-languageserver";
import { Diagnostic } from "./Diagnostic";

/**
 * Represents a diagnostic which provides information about an `eslint` failure.
 */
export class ESLintDiagnostic extends Diagnostic
{
    /**
     * The lint failure.
     */
    private lintMessage: Linter.LintMessage;

    /**
     * Initializes a new instance of the `ESLintDiagnostic`.
     *
     * @param typeScript
     * The typescript server.
     *
     * @param file
     * The file containing the failure.
     *
     * @param lintMessage
     * The lint failure.
     */
    public constructor(typeScript: typeof ts, file: ts.SourceFile, lintMessage: Linter.LintMessage)
    {
        super(typeScript, file);
        this.lintMessage = lintMessage;
    }

    /**
     * Gets the lint failure.
     */
    public get LintMessage(): Linter.LintMessage
    {
        return this.lintMessage;
    }

    /**
     * @inheritdoc
     */
    public get Category(): ts.DiagnosticCategory
    {
        let result: ts.DiagnosticCategory;

        switch (this.LintMessage.severity)
        {
            case 2:
                result = this.TypeScript.DiagnosticCategory.Error;
                break;
            case 1:
            default:
                result = this.TypeScript.DiagnosticCategory.Warning;
                break;
        }

        return result;
    }

    /**
     * @inheritdoc
     */
    public get Range(): Range
    {
        return {
            start: {
                line: this.LintMessage.line,
                character: this.LintMessage.column
            },
            end: {
                line: this.LintMessage.endLine,
                character: this.LintMessage.endColumn
            }
        };
    }

    /**
     * @inheritdoc
     */
    public get Message(): string | ts.DiagnosticMessageChain
    {
        let result = `${this.LintMessage.message}`;

        if (this.LintMessage.ruleId)
        {
            result = `${result} (${this.LintMessage.ruleId})`;
        }

        return result;
    }
}
