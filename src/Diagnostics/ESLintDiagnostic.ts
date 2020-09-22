import { Linter } from "eslint";
import { DiagnosticCategory, DiagnosticMessageChain, SourceFile } from "typescript/lib/tsserverlibrary";
import { Range } from "vscode-languageserver";
import { Plugin } from "../Plugin";
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
     * @param plugin
     * The plugin of the diagnostic.
     *
     * @param file
     * The file of the diagnostic.
     *
     * @param lintMessage
     * The lint failure.
     */
    public constructor(plugin: Plugin, file: SourceFile, lintMessage: Linter.LintMessage)
    {
        super(plugin, file);
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
    public get Category(): DiagnosticCategory
    {
        let result: DiagnosticCategory;

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
    public get Message(): string | DiagnosticMessageChain
    {
        let result = `${this.LintMessage.message}`;

        if (this.LintMessage.ruleId)
        {
            result = `${result} (${this.LintMessage.ruleId})`;
        }

        return result;
    }
}
