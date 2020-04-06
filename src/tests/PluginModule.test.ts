import Assert = require("assert");
import ts = require("typescript/lib/tsserverlibrary");
import { PluginModule } from "../PluginModule";

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
            "Initialize(ts typescript)",
            () =>
            {
                test(
                    "Checking whether the module is exported correctly…",
                    () =>
                    {
                        Assert.ok(pluginModule.create);
                        Assert.ok(pluginModule.onConfigurationChanged);
                    });
            });
    });
