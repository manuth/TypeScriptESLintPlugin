import { DiagnosticTests } from "./Diagnostics";
import { EndToEndTests } from "./E2E";
import { LanguageServiceTester } from "./E2E/LanguageService/LanguageServiceTester";
import { InterceptionTests } from "./Interception";
import { ModuleTests } from "./Module.test";
import { PluginModuleTests } from "./PluginModule.test";

suite(
    "TypeScriptESLintPlugin",
    () =>
    {
        ModuleTests();
        PluginModuleTests();
        DiagnosticTests();
        InterceptionTests();
        EndToEndTests();

        suiteTeardown(
            async () =>
            {
                await LanguageServiceTester.Default.Dispose();
            });
    });
