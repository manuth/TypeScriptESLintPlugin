import { DiagnosticTests } from "./Diagnostics";
import { EndToEndTests } from "./E2E";
import { ModuleTests } from "./Module.test";
import { PluginModuleTests } from "./PluginModule.test";
import { SettingTests } from "./Settings";

suite(
    "TypeScriptESLintPlugin",
    () =>
    {
        ModuleTests();
        PluginModuleTests();
        SettingTests();
        DiagnosticTests();
        EndToEndTests();
    });
