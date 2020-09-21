import { DiagnosticCategory } from "typescript/lib/tsserverlibrary";
import { Message } from "./Message";

/**
 * Represents a message for installing `eslint`.
 */
export class ESLintNotInstalledMessage extends Message
{
    /**
     * Initializes a new instance of the `ESLintNotInstalledMessage` class.
     *
     * @param text
     * The text of the message.
     *
     * @param category
     * The category of the message.
     */
    public constructor(text: string, category: DiagnosticCategory)
    {
        super(text, category);
    }
}
