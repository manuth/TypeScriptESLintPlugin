import Assert = require("assert");
import { spawnSync } from "child_process";
import { pathToFileURL } from "url";
import FileSystem = require("fs-extra");
import npmWhich = require("npm-which");
import { TempDirectory, TempFile } from "@manuth/temp-files";
import { join } from "upath";
import { LanguageServiceTester } from "./LanguageServiceTester";
import { createRequire } from "module";

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

                await FileSystem.writeJSON(
                    context.TempDir.MakePath("tsconfig.json"),
                    {
                        compilerOptions: {
                            plugins: [
                                {
                                    name: "typescript-eslint-plugin"
                                }
                            ]
                        }
                    });

                await FileSystem.writeJSON(
                    context.TempDir.MakePath("package.json"),
                    {
                        name: "test",
                        dependencies:
                        {
                            "typescript-eslint-plugin": pathToFileURL(join(__dirname, "..", "..", "..", ".."))
                        }
                    });

                spawnSync(
                    npmPath,
                    [
                        "install"
                    ],
                    {
                        cwd: context.TempDir.FullName
                    });

                spawnSync(
                    npmPath,
                    [
                        "install",
                        "typescript"
                    ],
                    {
                        cwd: context.TempDir.FullName
                    });

                context.Tester = new LanguageServiceTester(context.TempDir.FullName);
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

        teardown(
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
