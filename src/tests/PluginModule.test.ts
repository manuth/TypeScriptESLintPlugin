import { ok } from "assert";
import ts = require("typescript/lib/tsserverlibrary");
import { PluginModule } from "../PluginModule";

/**
 * Registers tests for the {@link PluginModule `PluginModule`} class.
 */
export function PluginModuleTests(): void
{
    suite(
        "PluginModule",
        () =>
        {
            let pluginModule: PluginModule;

            suiteSetup(
                () =>
                {
                    pluginModule = new PluginModule(ts);
                });

            suite(
                "Initialize",
                () =>
                {
                    test(
                        "Checking whether the module is exported correctly…",
                        () =>
                        {
                            ok(pluginModule.create);
                            ok(pluginModule.onConfigurationChanged);
                        });
                });
        });
}
