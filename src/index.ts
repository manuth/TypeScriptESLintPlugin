import MockRequire = require("mock-require");
import TSServerLibrary = require("typescript/lib/tsserverlibrary");
import { IInitializationOptions } from "./IInitializationOptions";
import { PluginModule } from "./PluginModule";

/**
 * Initializes the module.
 */
export = function Initialize({ typescript }: IInitializationOptions): TSServerLibrary.server.PluginModule
{
    MockRequire("typescript", typescript);
    let pluginModule = new PluginModule();
    return pluginModule.Initialize(typescript);
};
