import { Plugin } from "../Plugin";
import { LoggerBase } from "./LoggerBase";
import { LogLevel } from "./LogLevel";

/**
 * Provides the functionality to print log messages according to the configuration of the plugin.
 */
export class PluginLogger extends LoggerBase
{
    /**
     * The plugin.
     */
    private plugin: Plugin;

    /**
     * Initializes a new instance of the {@link PluginLogger `PluginLogger`} class.
     *
     * @param plugin
     * The plugin of the logger.
     *
     * @param category
     * The category of the logger.
     */
    public constructor(plugin: Plugin, category?: string)
    {
        super(category);
        this.plugin = plugin;
    }

    /**
     * Gets the plugin.
     */
    protected get Plugin(): Plugin
    {
        return this.plugin;
    }

    /**
     * Gets the configured log-level of the plugin.
     */
    public get LogLevel(): LogLevel
    {
        return this.Plugin.Config.LogLevel;
    }

    /**
     * Writes the specified  {@link message `message`} to the log.
     *
     * @param message
     * The message to write.
     */
    protected Write(message: string): void
    {
        this.Plugin.ConfigurationManager.PluginInfo?.project.projectService.logger.info(message);
    }
}
