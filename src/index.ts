import MockRequire = require("mock-require");
import TSServerLibrary = require("typescript/lib/tsserverlibrary");
import { IInitializationOptions } from "./IInitializationOptions";
import { PluginModule } from "./PluginModule";

/**
 * The plugin-module.
 */
let pluginModule: PluginModule;

/**
 * Initializes the module.
 */
export = function Initialize({ typescript }: IInitializationOptions): TSServerLibrary.server.PluginModule
{
    pluginModule = pluginModule ?? new PluginModule();
    return pluginModule.Initialize(typescript);
};
