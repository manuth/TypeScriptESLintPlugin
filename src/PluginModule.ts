import TSServerLibrary = require("typescript/lib/tsserverlibrary");
import { Constants } from "./Constants";
import { Logger } from "./Logging/Logger";
import { Plugin } from "./Plugin";
import { Configuration } from "./Settings/Configuration";

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
     * Initializes a new instance of the `PluginModule` class.
     */
    public constructor()
    { }

    /**
     * Gets a component for writing log-messages.
     */
    public get Logger(): Logger
    {
        return this.logger;
    }

    /**
     * Gets the configuration of the pluginn.
     */
    public get Config(): Configuration
    {
        return this.Plugin?.Config;
    }

    /**
     * Gets the plugin.
     */
    public get Plugin(): Plugin
    {
        return this.plugin;
    }

    /**
     * Initializes a new module.
     */
    public Initialize(typescript: typeof TSServerLibrary): TSServerLibrary.server.PluginModule
    {
        let pluginModule: TSServerLibrary.server.PluginModule = {
            create: (pluginInfo) =>
            {
                pluginInfo.languageServiceHost.error("hello world");
                this.logger = Logger.Create(this, pluginInfo.project.projectService.logger, Constants.PluginName);
                this.Logger.Info(`Creating the '${Constants.PluginName}'-module…`);

                if (this.IsValidTypeScriptVersion(typescript))
                {
                    this.plugin = new Plugin(this, typescript, pluginInfo);
                    return this.Plugin.Decorate(pluginInfo.languageService);
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
                this.Plugin.UpdateConfig(config);
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
