import { Plugin } from "../Plugin";
import { Configuration } from "../Settings/Configuration";
import { LoggerBase } from "./LoggerBase";

/**
 * Provides the functionality to print log messages.
 */
export class PluginLogger extends LoggerBase
{
    /**
     * The plugin.
     */
    private plugin: Plugin;

    /**
     * Initializes a new instance of the `Logger` class.
     *
     * @param plugin
     * The plugin.
     *
     * @param createInfo
     * Information for the plugin.
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
     * Gets the configuration of the plugin.
     */
    public get Config(): Configuration
    {
        return this.Plugin.Config;
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
