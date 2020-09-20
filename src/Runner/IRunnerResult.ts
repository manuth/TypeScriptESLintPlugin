import { CLIEngine } from "eslint";
import { IMessage } from "../Diagnostics/IMessage";

/**
 * Represents the result of the runner.
 */
export interface IRunnerResult
{
    /**
     * The report of `eslint`.
     */
    Report: CLIEngine.LintReport;

    /**
     * Messages which have been produced while linting.
     */
    Messages: IMessage[];
}
