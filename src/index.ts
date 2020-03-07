import MockRequire = require("mock-require");
import { IInitializationOptions } from "./IInitializationOptions";
import { PluginModule } from "./PluginModule";

/**
 * Initializes the module.
 */
export = function Initialize({ typescript }: IInitializationOptions) {
    MockRequire("typescript", typescript);
    let pluginModule = new PluginModule();
    return pluginModule.Initialize(typescript);
};