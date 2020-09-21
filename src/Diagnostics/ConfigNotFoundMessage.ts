import { DiagnosticCategory } from "typescript/lib/tsserverlibrary";
import { IMessage } from "./IMessage";

/**
 * Represents a message for a missing configuration.
 */
export class ConfigNotFoundMessage implements IMessage
{
    /**
     * The actual exception.
     */
    private exception: Error;

    /**
     * The category of the message.
     */
    private category: DiagnosticCategory;

    /**
     * Initializes a new instance of the `ConfigNotFoundMessage` class.
     *
     * @param exception
     * The actual exception.
     *
     * @param category
     * The category of the message.
     */
    public constructor(exception: Error, category: DiagnosticCategory)
    {
        this.exception = exception;
        this.category = category;
    }

    /**
     * @inheritdoc
     */
    public get Category(): DiagnosticCategory
    {
        return this.category;
    }

    /**
     * @inheritdoc
     */
    public get Text(): string
    {
        return this.exception.message;
    }
}
