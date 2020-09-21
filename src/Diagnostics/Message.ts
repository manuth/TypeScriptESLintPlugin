import { DiagnosticCategory } from "typescript/lib/tsserverlibrary";
import { IMessage } from "./IMessage";

/**
 * Represents a diagnostic-message.
 */
export class Message implements IMessage
{
    /**
     * The text of the message.
     */
    private text: string;

    /**
     * The category of the message.
     */
    private category: DiagnosticCategory;

    /**
     * Initializes a new instance of the `Message` class.
     *
     * @param text
     * The text of the message.
     *
     * @param category
     * The category of the message.
     */
    public constructor(text: string, category: DiagnosticCategory)
    {
        this.text = text;
        this.category = category;
    }

    /**
     * @inheritdoc
     */
    public get Text(): string
    {
        return this.text;
    }

    /**
     * @inheritdoc
     */
    public get Category(): DiagnosticCategory
    {
        return this.category;
    }
}
