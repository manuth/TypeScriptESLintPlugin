import { ok } from "assert";
import ts = require("typescript/lib/tsserverlibrary");
import moduleInitializer = require("..");

/**
 * Registers tests for the module.
 */
export function ModuleTests(): void
{
    suite(
        "Module",
        () =>
        {
            test(
                "Checking whether the module is exported correctly…",
                () =>
                {
                    let pluginModule = moduleInitializer({ typescript: ts });
                    ok(pluginModule.create);
                    ok(pluginModule.onConfigurationChanged);
                });
        });
}
