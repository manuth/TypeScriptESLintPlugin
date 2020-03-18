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
export class PluginModule implements ts.server.PluginModule
{
    /**
     * The typescript-server library.
     */
    private typescript: typeof ts;

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
    public constructor(typescript: typeof ts)
    {
        this.typescript = typescript;
    }

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
     * Creates a decorated language-service.
     *
     * @param createInfo
     * Information for the plugin.
     */
    public create(createInfo: ts.server.PluginCreateInfo): ts.LanguageService
    {
        this.configurationManager = new ConfigurationManager(this, createInfo);
        this.logger = Logger.Create(this, Constants.PluginName);
        this.Logger?.Info(`Creating the '${Constants.PluginName}'-module…`);

        if (this.IsValidTypeScriptVersion(this.typescript))
        {
            if (this.plugin === null)
            {
                this.plugin = new Plugin(this, this.typescript, createInfo);
            }
            else
            {
                this.plugin.PluginInfo = createInfo;
            }

            return this.plugin.Decorate(createInfo.languageService);
        }
        else
        {
            this.Logger?.Info("Invalid typescript version detected. The ESLint plugin requires TypeScript 3.x");
            return createInfo.languageService;
        }
    }

    /**
     * Occurrs when the configuration is about to change.
     *
     * @param config
     * The configuration to apply.
     */
    public onConfigurationChanged?(config: any): void
    {
        this.Logger?.Info("onConfigurationChanged occurred…");
        this.ConfigurationManager.Update(config);
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
