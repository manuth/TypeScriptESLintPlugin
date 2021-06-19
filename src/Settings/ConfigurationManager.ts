import type { server } from "typescript/lib/tsserverlibrary";
import { LoggerBase } from "../Logging/LoggerBase";
import { LogLevel } from "../Logging/LogLevel";
import { Plugin } from "../Plugin";
import { Configuration } from "./Configuration";
import { ITSConfiguration } from "./ITSConfiguration";

/**
 * Proides the functionality to manage and automatically reload configurations.
 */
export class ConfigurationManager
{
    /**
     * The plugin.
     */
    private plugin: Plugin;

    /**
     * Information for the plugin.
     */
    private pluginInfo: server.PluginCreateInfo = null;

    /**
     * The configuration.
     */
    private config: Configuration;

    /**
     * The event-handlers for the {@link ConfigurationManager.ConfigUpdated `ConfigUpdated`}-event.
     */
    private readonly configUpdated = new Set<() => void>();

    /**
     * Initializes a new instance of the {@link ConfigurationManager `ConfigurationManager`} class.
     *
     * @param pluginModule
     * The plugin of the configuration-manager.
     */
    public constructor(pluginModule: Plugin)
    {
        this.plugin = pluginModule;
        this.config = new Configuration({}, this);
    }

    /**
     * Gets the plugin.
     */
    public get Plugin(): Plugin
    {
        return this.plugin;
    }

    /**
     * Gets or sets information for the plugin.
     */
    public get PluginInfo(): server.PluginCreateInfo
    {
        return this.pluginInfo;
    }

    /**
     * @inheritdoc
     */
    public set PluginInfo(value)
    {
        this.pluginInfo = value;
        this.OnConfigUpdated();
    }

    /**
     * Gets a component for writing log-messages.
     */
    public get RealLogger(): LoggerBase
    {
        return this.Plugin.RealLogger.CreateSubLogger(ConfigurationManager.name);
    }

    /**
     * Gets a component for writing log-messages.
     */
    public get Logger(): LoggerBase
    {
        if (this.Config.LogLevel !== LogLevel.None)
        {
            return this.RealLogger;
        }
        else
        {
            return null;
        }
    }

    /**
     * Gets or sets the configuration.
     */
    public get Config(): Configuration
    {
        return this.config;
    }

    /**
     * Occurs when the config is updated.
     */
    public get ConfigUpdated(): Pick<Set<() => void>, "add" | "delete">
    {
        return {
            add: (eventHandler): Set<() => void> => this.configUpdated.add(eventHandler),
            delete: (eventHandler): boolean => this.configUpdated.delete(eventHandler)
        };
    }

    /**
     * Updates the configuration.
     *
     * @param config
     * The config to load.
     */
    public Update(config: ITSConfiguration): void
    {
        this.Logger?.Log("Updating the configuration…");
        this.config = new Configuration(config, this);
        this.OnConfigUpdated();
    }

    /**
     * Executes the {@link ConfigUpdated `ConfigUpdated`} event-handlers.
     */
    protected OnConfigUpdated(): void
    {
        this.Logger?.Log("The configuration has been updated.");
        this.Logger?.Log("Invoking event-handlers…");

        for (let eventHandler of this.configUpdated)
        {
            eventHandler();
        }
    }
}
