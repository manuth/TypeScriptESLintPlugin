import ts = require("typescript/lib/tsserverlibrary");
import { Constants } from "./Constants";
import { Logger } from "./Logging/Logger";
import { Plugin } from "./Plugin";
import { Configuration } from "./Settings/Configuration";
import { ConfigurationManager } from "./Settings/ConfigurationManager";
import { LogLevel } from "./Logging/LogLevel";

/**
 * Represents the plugin-module.
 */
export class PluginModule
{
    /**
     * The plugin.
     */
    private plugin: Plugin = null;

    /**
     * A component for logging messages.
     */
    private logger: Logger = null;

    /**
     * A component for managing configurations.
     */
    private configurationManager: ConfigurationManager;

    /**
     * Initializes a new instance of the `PluginModule` class.
     */
    public constructor()
    { }

    /**
     * Gets a component for writing log-messages.
     */
    public get Logger(): Logger
    {
        if (this.Config.LogLevel !== LogLevel.None)
        {
            return this.logger;
        }
        else
        {
            return null;
        }
    }

    /**
     * Gets a component for managing configurations.
     */
    public get ConfigurationManager(): ConfigurationManager
    {
        return this.configurationManager;
    }

    /**
     * Gets the configuration of the plugin.
     */
    public get Config(): Configuration
    {
        return this.ConfigurationManager.Config;
    }

    /**
     * Initializes a new module.
     */
    public Initialize(typescript: typeof ts): ts.server.PluginModule
    {
        let pluginModule: ts.server.PluginModule = {
            create: (pluginInfo) =>
            {
                this.configurationManager = new ConfigurationManager(this, pluginInfo);
                this.logger = Logger.Create(this, Constants.PluginName);
                this.Logger?.Info(`Creating the '${Constants.PluginName}'-module…`);

                if (this.IsValidTypeScriptVersion(typescript))
                {
                    if (this.plugin === null)
                    {
                        this.plugin = new Plugin(this, typescript, pluginInfo);
                    }
                    else
                    {
                        this.plugin.PluginInfo = pluginInfo;
                    }

                    return this.plugin.Decorate(pluginInfo.languageService);
                }
                else
                {
                    this.Logger?.Info("Invalid typescript version detected. The ESLint plugin requires TypeScript 3.x");
                    return pluginInfo.languageService;
                }
            },

            onConfigurationChanged: (config) =>
            {
                this.Logger?.Info("onConfigurationChanged occurred…");
                this.ConfigurationManager.Update(config);
            }
        };

        return pluginModule;
    }

    /**
     * Checks whether the required `typescript`-version is satisfied.
     *
     * @param typescript
     * The `typescript`-server to check.
     *
     * @returns
     * A value indicating whether the typescript-version is valid.
     */
    protected IsValidTypeScriptVersion(typescript: typeof ts): boolean
    {
        const [major] = typescript.version.split(".");
        return parseInt(major, 10) >= 3;
    }
}
