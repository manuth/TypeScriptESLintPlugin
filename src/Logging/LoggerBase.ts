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
    protected get Prefix(): string
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
 * Represents a logger that is attached to a parent logger.
 */
export class SubLogger extends LoggerBase
{
    /**
     * Gets or sets the parent of the logger.
     */
    public Parent: LoggerBase;

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
     * Gets the category-path of the logger.
     */
    protected get CategoryPath(): string[]
    {
        let result: string[];

        if (this.Parent instanceof SubLogger)
        {
            result = this.Parent.CategoryPath;
        }
        else
        {
            result = [this.Parent.Category];
        }

        result.push(this.Category);
        return result;
    }

    /**
     * Gets the top-level sub-logger.
     */
    protected get RootSubLogger(): SubLogger
    {
        let result: SubLogger;
        let logger: LoggerBase = this;

        while (logger instanceof SubLogger)
        {
            result = logger;
            logger = logger.Parent;
        }

        return result;
    }

    /**
     * @inheritdoc
     */
    protected get Prefix(): string
    {
        return this.CategoryPath.map((node) => `[${node}]`).join("") + " ";
    }

    /**
     * Gets or sets the logger of this sub-logger.
     */
    protected get RootLogger(): LoggerBase
    {
        return this.RootSubLogger.Parent;
    }

    protected set RootLogger(value)
    {
        this.RootSubLogger.Parent = value;
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
        (this.RootLogger as any as SubLogger).Write(message, logLevel);
    }
}
