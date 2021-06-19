import type ts = require("typescript/lib/tsserverlibrary");
import { Plugin } from "./Plugin";
import { ITSConfiguration } from "./Settings/ITSConfiguration";

/**
 * Represents a plugin-module.
 */
export class PluginModule implements ts.server.PluginModule
{
    /**
     * The typescript-server.
     */
    private typescript: typeof ts;

    /**
     * The projects and their plugin.
     */
    private plugins: Map<string, Plugin> = new Map();

    /**
     * The configuration of the plugins.
     */
    private config: ITSConfiguration;

    /**
     * Initializes a new instance of the {@link PluginModule `PluginModule`} class.
     *
     * @param typescript
     * The typescript-server.
     */
    public constructor(typescript: typeof ts)
    {
        this.typescript = typescript;
    }

    /**
     * Gets the typescript-server.
     */
    public get TypeScript(): typeof ts
    {
        return this.typescript;
    }

    /**
     * Creates a decorated {@link ts.LanguageService `LanguageService`}.
     *
     * @param createInfo
     * Information for the plugin.
     *
     * @returns
     * The newly created {@link ts.LanguageService `LanguageService`}.
     */
    public create(createInfo: ts.server.PluginCreateInfo): ts.LanguageService
    {
        let projectName = createInfo.project.projectName;
        let plugin: Plugin;

        if (createInfo.project instanceof this.typescript.server.ConfiguredProject)
        {
            let pluginConfig = (createInfo.project.getCompilerOptions().plugins as ts.PluginImport[])?.find((configEntry) => configEntry.name === createInfo.config.name);

            if (pluginConfig)
            {
                /**
                 * When using a plugin globally (for instance by adding it to the `typescriptServerPlugins`-contribution in a VSCode-extension)
                 * the `createInfo.config`-object contains the global settings rather than the actual plugin-settings.
                 *
                 * If `createInfo.config` and `pluginConfig` is different, `createInfo.config` must contain global settings.
                 * Global settings are redirected to `onConfigurationChanged` and `createInfo.config` is replaced by the actual plugin-config.
                 */
                if (JSON.stringify(createInfo.config) !== JSON.stringify(pluginConfig))
                {
                    this.onConfigurationChanged(createInfo.config);
                    createInfo.config = pluginConfig;
                }
            }
        }

        if (!this.plugins.has(projectName))
        {
            plugin = new Plugin(this, createInfo);
            this.plugins.set(projectName, plugin);
            plugin.Logger?.Log(`Successfully created a new plugin for '${projectName}'`);

            if (this.config)
            {
                plugin.Logger?.Log("Applying the global config…");
                plugin.UpdateConfig(this.config);
            }
        }
        else
        {
            plugin = this.plugins.get(projectName);
            plugin.Logger?.Log(`A plugin for '${projectName}' already exists… Updating the plugin…`);
            plugin.ConfigurationManager.PluginInfo = createInfo;
        }

        plugin.Logger?.Log("Printing the configuration…");
        plugin.Logger?.Log(JSON.stringify(createInfo.config));
        return plugin.Decorate(createInfo.languageService);
    }

    /**
     * Occurs when the configuration is about to change.
     *
     * @param config
     * The configuration to apply.
     */
    public onConfigurationChanged?(config: any): void
    {
        this.config = config;

        for (let keyValuePair of this.plugins)
        {
            let plugin = keyValuePair[1];
            plugin.UpdateConfig(this.config);
        }
    }
}
