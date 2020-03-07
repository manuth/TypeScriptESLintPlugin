import TSServerLibrary = require("typescript/lib/tsserverlibrary");
import { Constants } from "./Constants";
import { Logger } from "./Logging/Logger";
import { Plugin } from "./Plugin";
import { Configuration } from "./Settings/Configuration";
import { ConfigurationManager } from "./Settings/ConfigurationManager";

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
     * A component for managing the configuration.
     */
    private configurationManager: ConfigurationManager = null;

    /**
     * A component for logging messages.
     */
    private logger: Logger = null;

    /**
     * Initializes a new instance of the `PluginModule` class.
     */
    public constructor()
    { }

    /**
     * Gets a component for managing the configuration.
     */
    public get ConfigurationManager(): ConfigurationManager
    {
        return this.configurationManager;
    }

    /**
     * Gets the configuration of the module.
     */
    public get Config(): Configuration
    {
        return this.ConfigurationManager.Config;
    }

    /**
     * Gets a component for writing log-messages.
     */
    public get Logger(): Logger
    {
        return this.logger;
    }

    /**
     * Initializes a new module.
     */
    public Initialize(typescript: typeof TSServerLibrary): TSServerLibrary.server.PluginModule
    {
        let pluginModule: TSServerLibrary.server.PluginModule = {
            create: (pluginInfo) =>
            {
                this.logger = Logger.Create(this, pluginInfo.project.projectService.logger, Constants.PluginName);
                this.Logger.Info(`Creating the '${Constants.PluginName}'-module…`);

                if (this.IsValidTypeScriptVersion(typescript))
                {
                    this.configurationManager = new ConfigurationManager(this.Logger.CreateSubLogger(ConfigurationManager.name));
                    this.ConfigurationManager.Update(pluginInfo.config);
                    let plugin = new Plugin(this, typescript, pluginInfo);
                    return plugin.Decorate(pluginInfo.languageService);
                }
                else
                {
                    this.Logger.Info("Invalid typescript version detected. The ESLint plugin requires TypeScript 3.x");
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
    protected IsValidTypeScriptVersion(typescript: typeof TSServerLibrary): boolean
    {
        const [major] = typescript.version.split(".");
        return parseInt(major, 10) >= 3;
    }
}