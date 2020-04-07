import Assert = require("assert");
import { spawnSync } from "child_process";
import { pathToFileURL } from "url";
import FileSystem = require("fs-extra");
import npmWhich = require("npm-which");
import { TempDirectory } from "temp-filesystem";
import { join } from "upath";
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

suite(
    "General",
    () =>
    {
        let fileContent: string;

        suiteSetup(
            () =>
            {
                fileContent = "  \n";
            });

        suite(
            "Installation",
            () =>
            {
                let eslintGlobalPreset: boolean;

                /**
                 * Registers action for starting and stopping the test-server.
                 *
                 * @param context
                 * The test-context.
                 *
                 * @param setup
                 * A value indicating whether necessary dependencies should be installed.
                 */
                let registerServer = (context: ITestContext, install = true): void =>
                {
                    suiteSetup(
                        async function()
                        {
                            this.enableTimeouts(false);
                            context.TempDir = new TempDirectory();

                            if (install)
                            {
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
                                    npmWhich(__dirname).sync("npm"),
                                    [
                                        "install"
                                    ],
                                    {
                                        cwd: context.TempDir.FullName
                                    });

                                spawnSync(
                                    npmWhich(__dirname).sync("npm"),
                                    [
                                        "install",
                                        "typescript"
                                    ],
                                    {
                                        cwd: context.TempDir.FullName
                                    });
                            }

                            context.Tester = new LanguageServiceTester(context.TempDir.FullName);
                        });

                    suiteTeardown(
                        async function()
                        {
                            this.enableTimeouts(false);
                            await context.Tester.Dispose();
                        });
                };

                /**
                 * Performs eslint-installation actions.
                 *
                 * @param uninstall
                 * A value indicating whether eslint should be installed or uninstalled.
                 *
                 * @param global
                 * A value indicating whether the action should be performed in a global or a local scope.
                 */
                let installESLint = (context: ITestContext, uninstall: boolean, global: boolean): void =>
                {
                    spawnSync(
                        npmWhich(__dirname).sync("npm"),
                        [
                            uninstall ? "uninstall" : "install",
                            ...(global ? ["-g"] : []),
                            "eslint"
                        ],
                        {
                            cwd: context.TempDir.FullName
                        });
                };

                /**
                 * Registers a mocha-task for checking eslint installation errors.
                 *
                 * @param context
                 * The test-context.
                 *
                 * @param expectError
                 * A value indicating whether an error is expected.
                 *
                 * @param global
                 * A value indicating whether eslint is installed globally.
                 */
                let registerESLintTest = (context: ITestContext, expectError: boolean, global: boolean): void =>
                {
                    test(
                        expectError ?
                            "Checking whether a warning is reported if `eslint` isn't installed…" :
                            `Checking whether the plugin works after installing eslint ${global ? "globally" : "locally"}…`,
                        async function()
                        {
                            this.enableTimeouts(false);
                            let response = await context.Tester.AnalyzeCode(fileContent);

                            Assert.strictEqual(
                                response.Diagnostics.some(
                                    (diagnostic) =>
                                    {
                                        return ("text" in diagnostic) && diagnostic.text.includes("npm install eslint");
                                    }),
                                expectError);
                        });
                };

                /**
                 * Registers a mocha-task for performing eslint-installation actions.
                 *
                 * @param context
                 * The test-context.
                 *
                 * @param uninstall
                 * A value indicating whether eslint should be installed or uninstalled.
                 *
                 * @param global
                 * A value indicating whether the action should be performed in a global or a local scope.
                 */
                let registerInstaller = (context: ITestContext, uninstall: boolean, global: boolean): void =>
                {
                    test(
                        `${uninstall ? "Uni" : "I"}nstalling \`eslint\` ${global ? "globally" : "locally"} if necessary…`,
                        function()
                        {
                            this.enableTimeouts(false);
                            installESLint(context, uninstall, global);
                        });
                };

                suite(
                    "Preparation",
                    () =>
                    {
                        let context: ITestContext = { Tester: null, TempDir: null };
                        registerServer(context, false);

                        test(
                            "Checking whether `eslint` is installed globally…",
                            function()
                            {
                                this.enableTimeouts(false);

                                let result = spawnSync(
                                    npmWhich(__dirname).sync("npm"),
                                    [
                                        "list",
                                        "-g",
                                        "eslint"
                                    ]);

                                eslintGlobalPreset = result.status === 0;
                            });

                        test(
                            "Uninstalling `eslint` globally if necessary…",
                            function()
                            {
                                this.enableTimeouts(false);

                                if (eslintGlobalPreset)
                                {
                                    installESLint(context, true, true);
                                }
                            });
                    });

                suite(
                    "Local",
                    () =>
                    {
                        let context: ITestContext = { Tester: null, TempDir: null };
                        registerServer(context);
                        registerESLintTest(context, true, false);
                        registerInstaller(context, false, false);
                        registerESLintTest(context, false, false);
                        registerInstaller(context, true, false);
                    });

                suite(
                    "Global",
                    () =>
                    {
                        let context: ITestContext = { Tester: null, TempDir: null };
                        registerServer(context);
                        registerESLintTest(context, true, true);
                        registerInstaller(context, false, true);
                        registerESLintTest(context, false, true);

                        test(
                            "Uninstalling `eslint` globally if necessary…",
                            function()
                            {
                                if (!eslintGlobalPreset)
                                {
                                    this.enableTimeouts(false);
                                    installESLint(context, true, true);
                                }
                            });
                    });
            });
    });
