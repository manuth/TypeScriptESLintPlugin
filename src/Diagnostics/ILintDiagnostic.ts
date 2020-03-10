import { Linter } from "eslint";

/**
 * Represents a problem.
 */
export interface ILintDiagnostic
{
    /**
     * The error.
     */
    lintMessage: Linter.LintMessage;

    /**
     * A value indicating whether the problem can be fixed automatically.
     */
    fixable: boolean;
}
