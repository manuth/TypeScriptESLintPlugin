import Assert = require("assert");
import { spawnSync } from "child_process";
import { pathToFileURL } from "url";
import FileSystem = require("fs-extra");
import npmWhich = require("npm-which");
import { TempDirectory } from "temp-filesystem";
import { join } from "upath";
import { LanguageServiceTester } from "./LanguageServiceTester";

suite(
    "General",
    () =>
    {
        let tempDir: TempDirectory;
        let tester: LanguageServiceTester;
        let fileName: string;
        let fileContent: string;

        suiteSetup(
            async function()
            {
                this.enableTimeouts(false);
                tempDir = new TempDirectory();
                fileName = tempDir.MakePath("index.ts");
                fileContent = "  \n";
                await FileSystem.createFile(fileName);

                await FileSystem.writeJSON(
                    tempDir.MakePath("tsconfig.json"),
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
                    tempDir.MakePath("package.json"),
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
                        cwd: tempDir.FullName
                    });

                spawnSync(
                    npmWhich(__dirname).sync("npm"),
                    [
                        "install",
                        "typescript"
                    ],
                    {
                        cwd: tempDir.FullName
                    });
            });

        suiteTeardown(
            function()
            {
                this.enableTimeouts(false);
                tempDir.Dispose();
            });

        suite(
            "Installation",
            () =>
            {
                let eslintGlobalPreset: boolean;

                /**
                 * Registers action for starting and stopping the test-server.
                 */
                let registerServer = (): void =>
                {
                    suiteSetup(
                        function()
                        {
                            this.enableTimeouts(false);
                            tester = new LanguageServiceTester(tempDir.FullName);
                        });

                    suiteTeardown(
                        async function()
                        {
                            this.enableTimeouts(false);
                            await tester.Dispose();
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
                let installESLint = (uninstall: boolean, global: boolean): void =>
                {
                    spawnSync(
                        npmWhich(__dirname).sync("npm"),
                        [
                            uninstall ? "uninstall" : "install",
                            ...(global ? ["-g"] : []),
                            "eslint"
                        ],
                        {
                            cwd: tempDir.FullName
                        });
                };

                /**
                 * Registers a mocha-task for checking eslint installation errors.
                 *
                 * @param expectError
                 * A value indicating whether an error is expected.
                 *
                 * @param global
                 * A value indicating whether eslint is installed globally.
                 */
                let registerESLintTest = (expectError: boolean, global: boolean): void =>
                {
                    test(
                        expectError ?
                            "Checking whether a warning is reported if `eslint` isn't installed…" :
                            `Checking whether the plugin works after installing eslint ${global ? "globally" : "locally"}…`,
                        async function()
                        {
                            this.enableTimeouts(false);
                            let response = await tester.AnalyzeCode(fileContent);

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
                 * @param uninstall
                 * A value indicating whether eslint should be installed or uninstalled.
                 *
                 * @param global
                 * A value indicating whether the action should be performed in a global or a local scope.
                 */
                let registerInstaller = (uninstall: boolean, global: boolean): void =>
                {
                    test(
                        `${uninstall ? "Uni" : "I"}nstalling \`eslint\` ${global ? "globally" : "locally"} if necessary…`,
                        function()
                        {
                            this.enableTimeouts(false);
                            installESLint(uninstall, global);
                        });
                };

                suite(
                    "Preparation",
                    () =>
                    {
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
                                    installESLint(true, true);
                                }
                            });
                    });

                suite(
                    "Local",
                    () =>
                    {
                        registerServer();
                        registerESLintTest(true, false);
                        registerInstaller(false, false);
                        registerESLintTest(false, false);
                        registerInstaller(true, false);
                    });

                suite(
                    "Global",
                    () =>
                    {
                        registerServer();
                        registerESLintTest(true, true);
                        registerInstaller(false, true);
                        registerESLintTest(false, true);
                    });

                test(
                    "Uninstalling `eslint` globally if necessary…",
                    function()
                    {
                        if (!eslintGlobalPreset)
                        {
                            this.enableTimeouts(false);
                            installESLint(true, true);
                        }
                    });
            });
    });
