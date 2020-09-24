import Assert = require("assert");
import { spawnSync } from "child_process";
import { createRequire } from "module";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import FileSystem = require("fs-extra");
import npmWhich = require("npm-which");
import { LanguageServiceTester } from "./LanguageServiceTester";

/**
 * Represents a context for testing a language-service.
 */
interface ITestContext
{
    /**
     * The language service tester.
     */
    Tester: LanguageServiceTester;

    /**
     * The directory of the context.
     */
    TempDir: TempDirectory;
}

/**
 * Registers common tests.
 */
export function GeneralTests(): void
{
    suite(
        "General",
        () =>
        {
            let npmPath: string;
            let tempGlobalDir: TempDirectory;
            let globalConfigPath: string;
            let globalConfigBackup: TempFile;
            let fileContent: string;
            let globalModulePath: string;
            let context: ITestContext;

            /**
             * Filters the specified `diagnostics` for messages which notify the user to install a linter.
             *
             * @param diagnostics
             * The diagnostics to filter.
             *
             * @returns
             * A set of diagnostics which notify the user to install a linter.
             */
            function FilterESLintDiagnostic(diagnostics: Array<ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition>): Array<ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition>
            {
                return diagnostics.filter(
                    (diagnostic) =>
                    {
                        return ("text" in diagnostic) && diagnostic.text.includes("npm install eslint");
                    });
            }

            suiteSetup(
                async function()
                {
                    this.timeout(0);
                    npmPath = npmWhich(__dirname).sync("npm");
                    tempGlobalDir = new TempDirectory();
                    globalConfigPath = JSON.parse(spawnSync(npmPath, ["config", "list", "-g", "--json"]).stdout.toString().trim())["globalconfig"];
                    globalConfigBackup = new TempFile();
                    await FileSystem.remove(globalConfigBackup.FullName);
                    await FileSystem.copy(globalConfigPath, globalConfigBackup.FullName);
                    fileContent = "console.log();\n";
                    globalModulePath = spawnSync(npmPath, ["prefix", "-g"]).stdout.toString().trim();
                    spawnSync(npmPath, ["set", "-g", "prefix", tempGlobalDir.FullName]);
                    context = { TempDir: null, Tester: null };
                    context.TempDir = new TempDirectory();
                    context.Tester = new LanguageServiceTester(context.TempDir.FullName);
                    await context.Tester.Initialize();
                    await context.Tester.Configure();
                });

            suiteTeardown(
                async () =>
                {
                    spawnSync(npmPath, ["set", "-g", "prefix", globalModulePath]);
                    await FileSystem.remove(globalConfigPath);
                    await FileSystem.copy(globalConfigBackup.FullName, globalConfigPath);
                    tempGlobalDir.Dispose();
                    globalConfigBackup.Dispose();
                    await context.Tester.Dispose();
                    context.TempDir.Dispose();
                });

            setup(
                async () =>
                {
                    for (let args of [[], ["-g"]])
                    {
                        spawnSync(npmPath, ["uninstall", ...args, "eslint"], { cwd: context.TempDir.FullName });
                    }
                });

            test(
                "Checking whether a warning is reported if `eslint` isn't installed…",
                async function()
                {
                    this.timeout(0);
                    let response = await context.Tester.AnalyzeCode(fileContent);
                    Assert.ok(FilterESLintDiagnostic(response.Diagnostics).length > 0);
                });

            test(
                "Checking whether the plugin works with globally installed `eslint`…",
                async function()
                {
                    this.timeout(0);
                    Assert.throws(() => createRequire(context.Tester.MakePath(".js")).resolve("eslint"));
                    spawnSync(npmPath, ["install", "-g", "eslint"], { cwd: context.TempDir.FullName });
                    Assert.strictEqual(FilterESLintDiagnostic((await context.Tester.AnalyzeCode(fileContent)).Diagnostics).length, 0);
                });

            test(
                "Checking whether the plugin works with locally installed `eslint`…",
                async function()
                {
                    this.timeout(0);
                    spawnSync(npmPath, ["install", "eslint"], { cwd: context.TempDir.FullName });
                    Assert.strictEqual(FilterESLintDiagnostic((await context.Tester.AnalyzeCode(fileContent)).Diagnostics).length, 0);
                });
        });
}
