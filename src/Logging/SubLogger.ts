import { LogLevel } from "./LogLevel";
import { LoggerBase } from "./LoggerBase";

/**
 * Represents a logger that is attached to a parent logger.
 */

/**
 * Represents a logger which belongs to another logger.
 */
export class SubLogger extends LoggerBase
{
    /**
     * Gets or sets the parent of the logger.
     */
    protected Parent: LoggerBase;

    /**
     * Initializes a new instance of the `SubLogger` class.
     *
     * @param parent
     * The parent of the logger.
     *
     * @param category
     * The category of the logger.
     */
    public constructor(parent: LoggerBase, category: string)
    {
        super(category);
        this.Parent = parent;
    }

    /**
     * @inheritdoc
     */
    public get LogLevel(): LogLevel
    {
        return this.Parent.LogLevel;
    }

    /**
     * Writes a message to the log.
     *
     * @param message
     * The message to write.
     *
     * @param level
     * The log-level of the message.
     */
    protected Write(message: string, logLevel: LogLevel): void
    {
        this.Parent.Log(message, logLevel);
    }
}
