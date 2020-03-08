import Assert = require("assert");
import TSServerLibrary = require("typescript/lib/tsserverlibrary");
import { PluginModule } from "../PluginModule";

suite(
    "PluginModule",
    () =>
    {
        let pluginModuleManager: PluginModule;
        let pluginModule: TSServerLibrary.server.PluginModule;

        suiteSetup(
            () =>
            {
                pluginModuleManager = new PluginModule();
            });

        suite(
            "Initialize(ts typescript)",
            () =>
            {
                test(
                    "Checking whether the module is exported correctly…",
                    () =>
                    {
                        pluginModule = pluginModuleManager.Initialize(TSServerLibrary);
                        Assert.ok(pluginModule.create);
                        Assert.ok(pluginModule.onConfigurationChanged);
                    });
            });
    });
