import { remove } from "fs-extra";
import { DiagnosticTests } from "./Diagnostics";
import { EndToEndTests } from "./E2E";
import { LanguageServiceTester } from "./E2E/LanguageService/LanguageServiceTester";
import { TestConstants } from "./E2E/TestConstants";
import { InterceptionTests } from "./Interception";
import { ModuleTests } from "./Module.test";
import { PluginModuleTests } from "./PluginModule.test";

suite(
    "TypeScriptESLintPlugin",
    () =>
    {
        suiteTeardown(
            async () =>
            {
                await LanguageServiceTester.Default.Dispose();
                await remove(TestConstants.TempWorkspaceDirectory);
            });

        ModuleTests();
        PluginModuleTests();
        DiagnosticTests();
        InterceptionTests();
        EndToEndTests();
    });
