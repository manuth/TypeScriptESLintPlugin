import { Plugin } from "../Plugin";
import { LogLevel } from "./LogLevel";
import { PluginLogger } from "./PluginLogger";

/**
 * Provides the functionality to print log messages according to the specified log-level.
 */
export class Logger extends PluginLogger
{
    /**
     * The log-level to print.
     */
    private logLevel: LogLevel;

    /**
     * Initializes a new instance of the {@link Logger `Logger`} class.
     *
     * @param plugin
     * The plugin.
     *
     * @param logLevel
     * The log-level to print.
     *
     * @param category
     * The category of the {@link Logger `Logger`}.
     */
    public constructor(plugin: Plugin, logLevel: LogLevel = LogLevel.Info, category?: string)
    {
        super(plugin, category);
        this.logLevel = logLevel;
    }

    /**
     * @inheritdoc
     */
    public override get LogLevel(): LogLevel
    {
        return this.logLevel;
    }
}
