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
        let projectName = createInfo.project.projectName;
        let plugin: Plugin;

        if (!this.plugins.has(projectName))
        {
            plugin = new Plugin(this, this.typescript, createInfo);
            this.plugins.set(projectName, plugin);
            plugin.Logger.Log(`Successfully created a new plugin for '${projectName}'`);
        }
        else
        {
            plugin = this.plugins.get(projectName);
            plugin.Logger.Log(`A plugin for '${projectName}' already exists… Updating the plugin…`);
            plugin.ConfigurationManager.PluginInfo = createInfo;
        }

        plugin.Logger.Log("Printing the configuration…");
        plugin.Logger.Log(JSON.stringify(createInfo.config));
        return plugin.Decorate(createInfo.languageService);
    }

    /**
     * Occurrs when the configuration is about to change.
     *
     * @param config
     * The configuration to apply.
     */
    public onConfigurationChanged?(config: any): void
    {
        for (let keyValuePair of this.plugins)
        {
            let plugin = keyValuePair[1];
            plugin.ConfigurationManager.Update(config);
        }
    }
}
