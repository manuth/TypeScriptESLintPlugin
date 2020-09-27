import { DiagnosticTests } from "./Diagnostics";
import { EndToEndTests } from "./E2E";
import { ModuleTests } from "./Module.test";
import { PluginModuleTests } from "./PluginModule.test";

suite(
    "TypeScriptESLintPlugin",
    () =>
    {
        ModuleTests();
        PluginModuleTests();
        DiagnosticTests();
        EndToEndTests();
    });
