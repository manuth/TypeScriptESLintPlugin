import { ok, strictEqual } from "assert";
import { spawnSync } from "child_process";
import { createRequire } from "module";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import { Diagnostic } from "@manuth/typescript-languageservice-tester";
import { copy, pathExists, remove } from "fs-extra";
import npmWhich = require("npm-which");
import pkgUp = require("pkg-up");
import { dirname, isAbsolute, relative } from "upath";
import { ESLintLanguageServiceTester } from "./ESLintLanguageServiceTester";

/**
 * Represents a context for testing a language-service.
 */
interface ITestContext
{
    /**
     * The language service tester.
     */
    Tester: ESLintLanguageServiceTester;

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
             * Filters the specified {@link diagnostics `diagnostics`} for messages which notify the user to install a linter.
             *
             * @param diagnostics
             * The diagnostics to filter.
             *
             * @returns
             * A set of diagnostics which notify the user to install a linter.
             */
            function FilterESLintDiagnostic(diagnostics: Diagnostic[]): Diagnostic[]
            {
                return diagnostics.filter(
                    (diagnostic) =>
                    {
                        return diagnostic.Message.includes("npm install eslint");
                    });
            }

            suiteSetup(
                async function()
                {
                    this.timeout(0);
                    npmPath = npmWhich(__dirname).sync("npm");
                    tempGlobalDir = new TempDirectory();
                    globalConfigPath = JSON.parse(spawnSync(npmPath, ["config", "list", "-g", "--json"]).stdout.toString().trim())["globalconfig"];

                    if (await pathExists(globalConfigPath))
                    {
                        globalConfigBackup = new TempFile();
                        await remove(globalConfigBackup.FullName);
                        await copy(globalConfigPath, globalConfigBackup.FullName);
                    }
                    else
                    {
                        globalConfigBackup = null;
                    }

                    fileContent = "console.log();\n";
                    globalModulePath = spawnSync(npmPath, ["prefix", "-g"]).stdout.toString().trim();
                    spawnSync(npmPath, ["set", "-g", "prefix", tempGlobalDir.FullName]);
                    context = { TempDir: null, Tester: null };
                    context.TempDir = new TempDirectory();
                    context.Tester = new ESLintLanguageServiceTester(context.TempDir.FullName);
                    await context.Tester.Install();
                    await context.Tester.Configure();
                });

            suiteTeardown(
                async function()
                {
                    this.timeout(0);
                    spawnSync(npmPath, ["set", "-g", "prefix", globalModulePath]);
                    await remove(globalConfigPath);

                    if (globalConfigBackup !== null)
                    {
                        await copy(globalConfigBackup.FullName, globalConfigPath);
                        globalConfigBackup.Dispose();
                    }

                    tempGlobalDir.Dispose();
                    await context.Tester.Dispose();
                    context.TempDir.Dispose();
                });

            setup(
                async function()
                {
                    this.timeout(0);

                    for (let args of [[], ["-g"]])
                    {
                        spawnSync(npmPath, ["uninstall", ...args, "eslint"], { cwd: context.TempDir.FullName });
                    }

                    try
                    {
                        let eslintPath = createRequire(context.TempDir.MakePath(".js")).resolve("eslint");
                        let relativePath = relative(context.TempDir.FullName, eslintPath);
                        delete require.cache[eslintPath];

                        if (!isAbsolute(relativePath) && !relativePath.startsWith(".."))
                        {
                            await remove(dirname(await pkgUp({ cwd: dirname(eslintPath) })));
                        }
                    }
                    catch { }
                });

            test(
                "Checking whether a warning is reported if `eslint` isn't installed…",
                async function()
                {
                    this.timeout(0.5 * 60 * 1000);
                    this.slow(1 * 60 * 1000);
                    let response = await context.Tester.AnalyzeCode(fileContent);
                    ok(FilterESLintDiagnostic(response.Diagnostics).length > 0);
                });

            test(
                "Checking whether the plugin works with globally installed `eslint`…",
                async function()
                {
                    this.timeout(0);
                    this.slow(1.5 * 60 * 1000);

                    try
                    {
                        createRequire(context.Tester.MakePath(".js")).resolve("eslint");
                    }
                    catch
                    {
                        ok(!await pathExists(createRequire(context.Tester.MakePath(".js")).resolve("eslint")));
                    }

                    spawnSync(npmPath, ["install", "-g", "eslint"], { cwd: context.TempDir.FullName });
                    strictEqual(FilterESLintDiagnostic((await context.Tester.AnalyzeCode(fileContent)).Diagnostics).length, 0);
                });

            test(
                "Checking whether the plugin works with locally installed `eslint`…",
                async function()
                {
                    this.timeout(0);
                    this.slow(1.5 * 60 * 1000);
                    spawnSync(npmPath, ["install", "eslint"], { cwd: context.TempDir.FullName });
                    strictEqual(FilterESLintDiagnostic((await context.Tester.AnalyzeCode(fileContent)).Diagnostics).length, 0);
                });
        });
}
