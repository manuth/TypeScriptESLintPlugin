import Assert = require("assert");
import { spawnSync } from "child_process";
import { pathExists, remove } from "fs-extra";
import npmWhich = require("npm-which");
import { DiagnosticsResponseAnalyzer } from "./DiagnosticsResponseAnalyzer";
import { LanguageServiceTester } from "./LanguageServiceTester";

/**
 * Registers tests for the configuration of the plugin.
 */
export function ConfigTests(): void
{
    suite(
        "Config",
        () =>
        {
            let tester: LanguageServiceTester;

            suiteSetup(
                () =>
                {
                    tester = LanguageServiceTester.Default;
                });

            teardown(
                async function()
                {
                    this.timeout(0);
                    await tester.ConfigurePlugin({});
                });

            test(
                "Checking whether JavaScript can be ignored…",
                async function()
                {
                    this.timeout(0);
                    let code = 'console.log("Hello World");;;';
                    let diagnosticsResponse = await tester.AnalyzeCode(code, "JS");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    diagnosticsResponse = await tester.AnalyzeCode(code, "JSX");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    await tester.ConfigurePlugin({ ignoreJavaScript: true });
                    diagnosticsResponse = await tester.AnalyzeCode(code, "JS");
                    Assert.strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                    diagnosticsResponse = await tester.AnalyzeCode(code, "JSX");
                    Assert.strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                });

            test(
                "Checking whether TypeScript can be ignored…",
                async function()
                {
                    this.timeout(0);
                    let code = 'console.log("Hello World")';
                    let diagnosticsResponse = await tester.AnalyzeCode(code, "TS");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    diagnosticsResponse = await tester.AnalyzeCode(code, "TSX");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    await tester.ConfigurePlugin({ ignoreTypeScript: true });
                    diagnosticsResponse = await tester.AnalyzeCode(code, "TS");
                    Assert.strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                    diagnosticsResponse = await tester.AnalyzeCode(code, "TSX");
                    Assert.strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                });

            test(
                "Checking whether inline-config can be prohibited…",
                async function()
                {
                    let ruleName = "spaced-comment";
                    let code = `/* eslint-disable ${ruleName} */
                                let x = "hello world"; //who KnoWs how To formAt cOmmENts?`;
                    this.timeout(0);
                    let response = await tester.AnalyzeCode(code);
                    Assert.strictEqual(response.Filter(ruleName).length, 0);
                    await tester.ConfigurePlugin({ allowInlineConfig: false });
                    response = await tester.AnalyzeCode(code);
                    Assert.ok(response.Filter(ruleName).length > 0);
                });

            test(
                "Checking whether the report of unused disable-directives can be disabled…",
                async function()
                {
                    this.timeout(0);
                    let code = "/* eslint-disable-next-line no-trailing-spaces */\n";

                    /**
                     * Checks whether at least one error-message for unnecessary `eslint-disable` directives is reported.
                     *
                     * @param response
                     * The response of the code-analysis.
                     *
                     * @returns
                     * A value indicating whether at least one error-message for unnecessary `eslint-disable` directives is reported.
                     */
                    let disableDirectiveDetector = (response: DiagnosticsResponseAnalyzer): boolean =>
                    {
                        return response.Diagnostics.some(
                            (diagnostic) =>
                            {
                                if ("text" in diagnostic)
                                {
                                    return !(/\([a-z-]*\)$/.test(diagnostic.text)) &&
                                        /\Weslint-disable\W/.test(diagnostic.text) &&
                                        /unused/i.test(diagnostic.text);
                                }
                                else
                                {
                                    return false;
                                }
                            });
                    };

                    Assert.ok(disableDirectiveDetector(await tester.AnalyzeCode(code)));
                    await tester.ConfigurePlugin({ reportUnusedDisableDirectives: false });
                    Assert.ok(!disableDirectiveDetector(await tester.AnalyzeCode(code)));
                });

            test(
                "Checking whether custom config-files can be loaded and eslintrc-files can be turned off…",
                async function()
                {
                    let emptyRule = "no-trailing-spaces";
                    let nonEmptyRule = "prefer-const";
                    let code = `let x = "hello world";  
                                console.log(x);  `;

                    this.timeout(0);
                    let response = await tester.AnalyzeCode(code);
                    Assert.ok(response.Filter(emptyRule).length > 0);
                    Assert.strictEqual(response.Filter(nonEmptyRule).length, 0);

                    await tester.ConfigurePlugin(
                        {
                            useEslintrc: false,
                            configFile: tester.MakePath("alternative.eslintrc.js")
                        });

                    response = await tester.AnalyzeCode(code);
                    Assert.ok(response.Filter(nonEmptyRule).length > 0);
                    Assert.strictEqual(response.Filter(emptyRule).length, 0);
                });

            test(
                "Checking whether all diagnostics can be changed to warnings…",
                async function()
                {
                    let ruleName = "no-extra-semi";
                    let code = 'let name = "John";;;';
                    this.timeout(0);

                    /**
                     * Checks whether at least one diagnostic with the specified error-level is present.
                     *
                     * @param diagnostics
                     * The diagnostics to check.
                     *
                     * @param errorLevel
                     * The error-level to filter.
                     *
                     * @returns
                     * A value indicating whether at least one diagnostic with the specified error-level is present.
                     */
                    let hasErrorLevel = (diagnostics: ts.server.protocol.Diagnostic[], errorLevel: string): boolean =>
                    {
                        return diagnostics.every((diagnostic) => diagnostic.category === errorLevel);
                    };

                    Assert.ok(hasErrorLevel((await tester.AnalyzeCode(code)).Filter(ruleName), "error"));
                    await tester.ConfigurePlugin({ alwaysShowRuleFailuresAsWarnings: true });
                    Assert.ok(hasErrorLevel((await tester.AnalyzeCode(code)).Filter(ruleName), "warning"));
                });

            test(
                "Checking whether eslint can be disabled when other errors are present…",
                async () =>
                {
                    let code = "let x: Array<sting>;  ";
                    let ruleName = "no-trailing-spaces";
                    Assert.ok((await tester.AnalyzeCode(code)).Filter(ruleName).length > 0);
                    await tester.ConfigurePlugin({ suppressWhileTypeErrorsPresent: true });
                    Assert.strictEqual((await tester.AnalyzeCode(code)).Filter(ruleName).length, 0);
                });

            test(
                "Checking whether warnings about the use of deprecated rules can be suppressed…",
                async function()
                {
                    let code = 'console.log("this code is correct");\n';

                    let workspace = await tester.CreateTemporaryWorkspace(
                        {
                            "prefer-reflect": "warn"
                        });

                    /**
                     * Checks whether at least one error-message for deprecated rules is reported.
                     *
                     * @param response
                     * The response of the code-analysis.
                     *
                     * @returns
                     * A value indicating whether at least one error-message for deprecated rules is reported.
                     */
                    let deprecatedRuleDetector = (response: DiagnosticsResponseAnalyzer): boolean =>
                    {
                        return response.Diagnostics.some(
                            (diagnostic) =>
                            {
                                if ("text" in diagnostic)
                                {
                                    return !(/\([a-z-]\)$/.test(diagnostic.text)) &&
                                        /deprecated/i.test(diagnostic.text);
                                }
                                else
                                {
                                    return false;
                                }
                            });
                    };

                    this.timeout(0);
                    Assert.ok(deprecatedRuleDetector(await workspace.AnalyzeCode(code)));
                    await workspace.Configure({ suppressDeprecationWarnings: true });
                    Assert.ok(!deprecatedRuleDetector(await workspace.AnalyzeCode(code)));
                });

            test(
                "Checking whether errors about missing eslint-configurations can be enabled…",
                async function()
                {
                    this.timeout(0);
                    let workspace = await tester.CreateTemporaryWorkspace({}, {}, true);
                    let eslintFile = workspace.MakePath(".eslintrc");

                    /**
                     * Checks whether at least one error-message about missing eslint-configurations is present.
                     *
                     * @param response
                     * The response of the code-analysis.
                     *
                     * @returns
                     * A value indicating whether at least one error-message about missing eslint-configurations is present.
                     */
                    let eslintConfigErrorDetector = (response: DiagnosticsResponseAnalyzer): boolean =>
                    {
                        return response.Diagnostics.some(
                            (diagnostic) =>
                            {
                                if ("text" in diagnostic)
                                {
                                    return diagnostic.text.startsWith("No ESLint configuration found");
                                }
                                else
                                {
                                    return false;
                                }
                            });
                    };

                    if (await pathExists(eslintFile))
                    {
                        await remove(eslintFile);
                    }

                    spawnSync(
                        npmWhich(workspace.MakePath()).sync("npm"),
                        [
                            "install",
                            "eslint"
                        ],
                        {
                            cwd: workspace.MakePath()
                        });

                    Assert.ok(!eslintConfigErrorDetector(await workspace.AnalyzeCode("")));
                    await workspace.Configure({ suppressConfigNotFoundError: false });
                    Assert.ok(eslintConfigErrorDetector(await workspace.AnalyzeCode("")));
                });

            test(
                "Checking whether `tsconfig.json`-files have a higher priority than the configuration…",
                async function()
                {
                    this.timeout(0);
                    let code = "    ";
                    let ruleName = "no-trailing-spaces";

                    let workspace = await tester.CreateTemporaryWorkspace(
                        {
                            [ruleName]: "warn"
                        },
                        {
                            ignoreJavaScript: false
                        });

                    await tester.ConfigurePlugin({ ignoreJavaScript: true });
                    let response = await workspace.AnalyzeCode(code, "JS");
                    Assert.ok(response.Filter(ruleName).length > 0);
                });
        });
}
