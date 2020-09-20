import { DiagnosticCategory } from "typescript/lib/tsserverlibrary";

/**
 * Represents a message to report.
 */
export interface IMessage
{
    /**
     * The test of the message.
     */
    Text: string;

    /**
     * The category of the message.
     */
    Category?: DiagnosticCategory;
}
