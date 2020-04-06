import { LogLevel } from "./LogLevel";

/**
 * Provides the functionality to log messages.
 */
export abstract class LoggerBase
{
    /**
     * Gets or sets the category of the logger.
     */
    public Category: string = null;

    /**
     * Initializes a new instance of the `LoggerBase` class.
     *
     * @param plugin
     * The plugin.
     *
     * @param category
     * The category of the logger.
     */
    public constructor(category?: string)
    {
        this.Category = category;
    }

    /**
     * Gets the log-level to log.
     */
    public abstract get LogLevel(): LogLevel;

    /**
     * Gets the prefix for the log-messages.
     */
    public get Prefix(): string
    {
        if (this.Category)
        {
            return `[${this.Category}]`;
        }
        else
        {
            return "";
        }
    }

    /**
     * Creates a sub-logger.
     *
     * @param category
     * The category of the sub-logger.
     */
    public CreateSubLogger(category: string): LoggerBase
    {
        return new SubLogger(this, category);
    }

    /**
     * Prints an info-message.
     *
     * @param message
     * The message to print.
     */
    public Info(message: string): void
    {
        this.Log(message, LogLevel.Info);
    }

    /**
     * Prints a verbose message.
     *
     * @param message
     * The message to print.
     */
    public Verbose(message: string): void
    {
        this.Log(message, LogLevel.Verbose);
    }

    /**
     * Prints a log-message.
     *
     * @param message
     * The message to print.
     *
     * @param level
     * The log-level of the message.
     */
    public Log(message: string, logLevel?: LogLevel): void
    {
        if (
            (logLevel !== LogLevel.None) &&
            ((logLevel !== LogLevel.Verbose) || (this.LogLevel === LogLevel.Verbose)))
        {
            if (this.Category)
            {
                message = `${this.Prefix} ${message}`;
            }

            this.Write(message, logLevel ?? LogLevel.Info);
        }
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
    protected abstract Write(message: string, logLevel: LogLevel): void;
}

/**
 * Represents a logger which belongs to another logger.
 */
class SubLogger extends LoggerBase
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
    public get Config(): Configuration
    {
        return this.Parent.Config;
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
