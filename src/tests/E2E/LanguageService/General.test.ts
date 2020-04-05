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
                tester = new LanguageServiceTester(tempDir.FullName);
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
            async function()
            {
                this.enableTimeouts(false);
                await tester.Dispose();
                tempDir.Dispose();
            });

        suite(
            "Installation",
            () =>
            {
                test(
                    "Checking whether a warning is reported if `eslint` isn't installed…",
                    async function()
                    {
                        this.enableTimeouts(false);
                        let response = await tester.AnalyzeCode(fileContent);

                        Assert.ok(
                            response.Diagnostics.some(
                                (diagnostic) =>
                                {
                                    return ("text" in diagnostic) && diagnostic.text.includes("npm install eslint");
                                }));
                    });

                test(
                    "Installing eslint…",
                    function()
                    {
                        this.enableTimeouts(false);

                        spawnSync(
                            npmWhich(__dirname).sync("npm"),
                            [
                                "install",
                                "eslint"
                            ],
                            {
                                cwd: tempDir.FullName
                            });
                    });

                test(
                    "Checking whether the plugin continues to work after installing eslint…",
                    async function()
                    {
                        this.enableTimeouts(false);
                        let response = await tester.AnalyzeCode(fileContent);

                        Assert.ok(
                            !response.Diagnostics.some(
                                (diagnostic) =>
                                {
                                    return ("text" in diagnostic) && diagnostic.text.includes("npm install eslint");
                                }));
                    });
            });
    });
