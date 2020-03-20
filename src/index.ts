import ts = require("typescript/lib/tsserverlibrary");
import { IInitializationOptions } from "./IInitializationOptions";
import { ModuleInitializer } from "./ModuleInitializer";

/**
 * The module-initializer.
 */
let initializer = new ModuleInitializer();

/**
 * Initializes the module.
 */
export = (options: IInitializationOptions): ts.server.PluginModule => initializer.Initialize(options);
