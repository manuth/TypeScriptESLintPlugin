import ts = require("typescript/lib/tsserverlibrary");
import { Constants as _Constants } from "./Constants";
import { IInitializationOptions as _IInitializationOptions } from "./IInitializationOptions";
import { ModuleInitializer as _ModuleInitializer } from "./ModuleInitializer";
import { Plugin as _Plugin } from "./Plugin";
import { PluginModule as _PluginModule } from "./PluginModule";
import { ITSConfiguration as _ITSConfiguration } from "./Settings/ITSConfiguration";

/**
 * The module-initializer.
 */
let initializer = new _ModuleInitializer();

/**
 * Initializes the module.
 *
 * @param options
 * The options for the plugin.
 *
 * @returns
 * The typescript-plugin.
 */
function initializeModule(options: _IInitializationOptions): ts.server.PluginModule
{
    return initializer.Initialize(options);
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace initializeModule
{
    export let Constants = _Constants;

    /**
     * Provides options for initialilzing this plugin.
     */
    export type IInitializationOptions = _IInitializationOptions;

    export let ModuleInitializer = _ModuleInitializer;
    export let Plugin = _Plugin;
    export let PluginModule = _PluginModule;

    /**
     * Represents the plugin section in the `tsconfig.json` file.
     */
    export type ITSConfiguration = _ITSConfiguration;
}

/**
 * Initializes the module.
 *
 * @param options
 * The options for the plugin.
 *
 * @returns
 * The typescript-plugin.
 */
export = initializeModule;
