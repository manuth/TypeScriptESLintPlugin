import Assert = require("assert");
import ts = require("typescript/lib/tsserverlibrary");
import moduleInitializer = require("..");

suite(
    "Module",
    () =>
    {
        test(
            "Checking whether the module is exported correctly…",
            () =>
            {
                let pluginModule = moduleInitializer({ typescript: ts });
                Assert.ok(pluginModule.create);
                Assert.ok(pluginModule.onConfigurationChanged);
            });
    });
