import { CLIEngine } from "eslint";

/**
 * Represents the result of the runner.
 */
export interface IRunnerResult
{
    /**
     * The report of `eslint`.
     */
    report: CLIEngine.LintReport;

    /**
     * Warnings which have been produced while linting.
     */
    warnings: string[];
}
