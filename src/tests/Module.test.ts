import Assert = require("assert");
import TSServerLibrary = require("typescript/lib/tsserverlibrary");
import moduleInitializer = require("..");

suite(
    "Module",
    () =>
    {
        test(
            "Checking whether the module is exported correctly…",
            () =>
            {
                let pluginModule = moduleInitializer({ typescript: TSServerLibrary });
                Assert.ok(pluginModule.create);
                Assert.ok(pluginModule.onConfigurationChanged);
            });
    });
