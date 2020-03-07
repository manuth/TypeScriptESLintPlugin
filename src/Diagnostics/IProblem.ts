import { Linter } from "eslint";

/**
 * Represents a problem.
 */
export interface IProblem
{
    /**
     * The error.
     */
    failure: Linter.LintMessage;

    /**
     * A value indicating whether the problem can be fixed automatically.
     */
    fixable: boolean;
}