import ts = require("typescript/lib/tsserverlibrary");
import { Plugin } from "./Plugin";

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
     * The projects and their plugin.
     */
    private plugins: Map<string, Plugin> = new Map();

    /**
     * Initializes a new instance of the `PluginModule` class.
     */
    public constructor(typescript: typeof ts)
    {
        this.typescript = typescript;
    }

    /**
     * Creates a decorated language-service.
     *
     * @param createInfo
     * Information for the plugin.
     */
    public create(createInfo: ts.server.PluginCreateInfo): ts.LanguageService
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
}
