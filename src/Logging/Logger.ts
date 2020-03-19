import { Plugin } from "../Plugin";
import { LogLevel } from "./LogLevel";

/**
 * Provides the functionality to log messages.
 */
export abstract class Logger
{
    /**
     * Gets or sets the category of the logger.
     */
    public Category: string = null;

    /**
     * The plugin-module.
     */
    private plugin: Plugin;

    /**
     * Initializes a new instance of the `LoggerBase` class.
     *
     * @param plugin
     * The plugin.
     *
     * @param category
     * The category of the logger.
     */
    public constructor(plugin: Plugin, category?: string)
    {
        this.plugin = plugin;
        this.Category = category;
    }

    /**
     * Gets the plugin.
     */
    public get Plugin(): Plugin
    {
        return this.plugin;
    }

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
     * Creates a new logger.
     *
     * @param plugin
     * The plugin.
     *
     * @param createInfo
     * Information for the plugin.
     *
     * @param category
     * The category of the logger.
     */
    public static Create(plugin: Plugin, category?: string): Logger
    {
        return new TSLogger(plugin, category);
    }

    /**
     * Creates a sub-logger.
     *
     * @param category
     * The category of the sub-logger.
     */
    public CreateSubLogger(category: string): Logger
    {
        return new SubLogger(this.plugin, this, category);
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
            ((logLevel !== LogLevel.Verbose) || (this.Plugin.Config.LogLevel === LogLevel.Verbose)))
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
class SubLogger extends Logger
{
    /**
     * Gets or sets the parent of the logger.
     */
    protected Parent: Logger;

    /**
     * Initializes a new instance of the `SubLogger` class.
     *
     * @param plugin
     * The plugin.
     *
     * @param parent
     * The parent of the logger.
     *
     * @param category
     * The category of the logger.
     */
    public constructor(plugin: Plugin, parent: Logger, category: string)
    {
        super(plugin, category);
        this.Parent = parent;
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

/**
 * Provides the functionality to print log messages.
 */
class TSLogger extends Logger
{
    /**
     * Initializes a new instance of the `Logger` class.
     *
     * @param plugin
     * The plugin.
     *
     * @param config
     * The configuration of the plugin.
     *
     * @param createInfo
     * Information for the plugin.
     */
    public constructor(plugin: Plugin, category?: string)
    {
        super(plugin, category);
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
    protected Write(message: string): void
    {
        this.Plugin.ConfigurationManager.PluginInfo?.project.projectService.logger.info(message);
    }
}
