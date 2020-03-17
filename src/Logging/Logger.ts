import TypeScriptServerLibrary = require("typescript/lib/tsserverlibrary");
import { PluginModule } from "../PluginModule";
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
    private pluginModule: PluginModule;

    /**
     * Initializes a new instance of the `LoggerBase` class.
     *
     * @param pluginModule
     * The plugin-module.
     *
     * @param category
     * The category of the logger.
     */
    public constructor(pluginModule: PluginModule, category?: string)
    {
        this.pluginModule = pluginModule;
        this.Category = category;
    }

    /**
     * Gets the plugin-module.
     */
    public get PluginModule(): PluginModule
    {
        return this.pluginModule;
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
     * @param pluginModule
     * The plugin-module.
     *
     * @param logger
     * The logger for writing messages.
     *
     * @param category
     * The category of the logger.
     */
    public static Create(pluginModule: PluginModule, logger: TypeScriptServerLibrary.server.Logger, category?: string): Logger
    {
        return new TSLogger(pluginModule, logger, category);
    }

    /**
     * Creates a sub-logger.
     *
     * @param category
     * The category of the sub-logger.
     */
    public CreateSubLogger(category: string): Logger
    {
        return new SubLogger(this.pluginModule, this, category);
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
            ((logLevel !== LogLevel.Verbose) || (this.PluginModule.Config.LogLevel === LogLevel.Verbose)))
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
     * @param pluginModule
     * The plugin-module.
     *
     * @param parent
     * The parent of the logger.
     *
     * @param category
     * The category of the logger.
     */
    public constructor(pluginModule: PluginModule, parent: Logger, category: string)
    {
        super(pluginModule, category);
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
     * The logger for printing log messages.
     */
    private logger: TypeScriptServerLibrary.server.Logger;

    /**
     * Initializes a new instance of the `Logger` class.
     *
     * @param pluginModule
     * The plugin-module.
     *
     * @param config
     * The configuration of the plugin.
     *
     * @param logger
     * The logger for printing log messages.
     */
    public constructor(pluginModule: PluginModule, logger: TypeScriptServerLibrary.server.Logger, category?: string)
    {
        super(pluginModule, category);
        this.logger = logger;
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
        this.logger.info(message);
    }
}
