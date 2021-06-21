import { ok } from "assert";
import ts = require("typescript/lib/tsserverlibrary");
import { PluginModule } from "../PluginModule";

/**
 * Registers tests for the {@link PluginModule `PluginModule`} class.
 */
export function PluginModuleTests(): void
{
    suite(
        nameof(PluginModule),
        () =>
        {
            let pluginModule: PluginModule;

            suiteSetup(
                () =>
                {
                    pluginModule = new PluginModule(ts);
                });

            suite(
                nameof(PluginModule.constructor),
                () =>
                {
                    test(
                        "Checking whether the instance exposes the expected methods…",
                        () =>
                        {
                            ok(pluginModule.create);
                            ok(pluginModule.onConfigurationChanged);
                        });
                });
        });
}
