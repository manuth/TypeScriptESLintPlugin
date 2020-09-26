import Assert = require("assert");
import { spawnSync } from "child_process";
import { copy, pathExists, remove } from "fs-extra";
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
            let correctCode: string;
            let incorrectCode: string;
            let ruleFailureCode: string;
            let ruleName: string;
            let disableLineComment: string;

            suiteSetup(
                () =>
                {
                    tester = LanguageServiceTester.Default;
                    correctCode = "";
                    incorrectCode = "let x: sting";
                    ruleFailureCode = 'console.log("Hello World");  ';
                    ruleName = "no-trailing-spaces";
                    disableLineComment = `/* eslint-disable-next-line ${ruleName} */`;
                });

            suiteTeardown(
                async () =>
                {
                    await tester.ConfigurePlugin({});
                    await tester.Configure();
                });

            setup(
                async function()
                {
                    this.timeout(4 * 1000);
                    await tester.ConfigurePlugin({});
                    await tester.Configure();

                    await tester.Configure(
                        {
                            [ruleName]: "warn"
                        });
                });

            test(
                "Checking whether JavaScript can be ignored…",
                async function()
                {
                    this.timeout(45 * 1000);
                    this.slow(30 * 1000);
                    let diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "JS");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "JSX");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    await tester.ConfigurePlugin({ ignoreJavaScript: true });
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "JS");
                    Assert.strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "JSX");
                    Assert.strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                });

            test(
                "Checking whether TypeScript can be ignored…",
                async function()
                {
                    this.timeout(45 * 1000);
                    this.slow(30 * 1000);
                    let diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "TS");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "TSX");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    await tester.ConfigurePlugin({ ignoreTypeScript: true });
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "TS");
                    Assert.strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "TSX");
                    Assert.strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                });

            test(
                "Checking whether inline-config can be prohibited…",
                async function()
                {
                    let code = `${disableLineComment}
                                ${ruleFailureCode}`;

                    this.timeout(8 * 1000);
                    this.slow(4 * 1000);
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
                    this.timeout(10 * 1000);
                    this.slow(5 * 1000);
                    let code = `${disableLineComment}\n`;

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
                                    return /\Weslint-disable\W/.test(diagnostic.text) &&
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
                    this.timeout(8 * 1000);
                    this.slow(4 * 1000);
                    let altESLintPath = tester.MakePath("alternative.eslintrc");
                    let altDisabledRule = "no-trailing-spaces";
                    let altEnabledRule = "prefer-const";

                    let code = `let x = "hello world";  
                                console.log(x);  `;

                    await tester.Configure(
                        {
                            [altDisabledRule]: "off",
                            [altEnabledRule]: "warn"
                        });

                    await copy(tester.MakePath(".eslintrc"), altESLintPath);

                    await tester.Configure(
                        {
                            [altDisabledRule]: "warn",
                            [altEnabledRule]: "off"
                        });

                    let response = await tester.AnalyzeCode(code);
                    Assert.ok(response.Filter(altDisabledRule).length > 0);
                    Assert.strictEqual(response.Filter(altEnabledRule).length, 0);

                    await tester.ConfigurePlugin(
                        {
                            useEslintrc: false,
                            configFile: tester.MakePath("alternative.eslintrc")
                        });

                    response = await tester.AnalyzeCode(code);
                    Assert.ok(response.Filter(altEnabledRule).length > 0);
                    Assert.strictEqual(response.Filter(altDisabledRule).length, 0);
                });

            test(
                "Checking whether all diagnostics can be changed to warnings…",
                async function()
                {
                    this.timeout(8 * 1000);
                    this.slow(4 * 1000);

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

                    await tester.Configure({ [ruleName]: "error" });
                    Assert.ok(hasErrorLevel((await tester.AnalyzeCode(ruleFailureCode)).Filter(ruleName), "error"));
                    await tester.ConfigurePlugin({ alwaysShowRuleFailuresAsWarnings: true });
                    Assert.ok(hasErrorLevel((await tester.AnalyzeCode(ruleFailureCode)).Filter(ruleName), "warning"));
                });

            test(
                "Checking whether eslint can be disabled when other errors are present…",
                async function()
                {
                    let code = `
                        ${ruleFailureCode}
                        ${incorrectCode}`;

                    this.timeout(8 * 1000);
                    this.slow(4 * 1000);
                    Assert.ok((await tester.AnalyzeCode(code)).Filter(ruleName).length > 0);
                    await tester.ConfigurePlugin({ suppressWhileTypeErrorsPresent: true });
                    Assert.strictEqual((await tester.AnalyzeCode(code)).Filter(ruleName).length, 0);
                });

            test(
                "Checking whether warnings about the use of deprecated rules can be suppressed…",
                async function()
                {
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

                    this.timeout(30 * 1000);
                    this.slow(15 * 1000);
                    Assert.ok(deprecatedRuleDetector(await workspace.AnalyzeCode(correctCode)));
                    await workspace.ConfigurePlugin({ suppressDeprecationWarnings: true });
                    Assert.ok(!deprecatedRuleDetector(await workspace.AnalyzeCode(correctCode)));
                });

            test(
                "Checking whether errors about the absence of an eslint-configurations can be enabled…",
                async function()
                {
                    this.timeout(3 * 60 * 1000);
                    this.slow(1.5 * 60 * 1000);
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

                    Assert.ok(!eslintConfigErrorDetector(await workspace.AnalyzeCode(correctCode)));
                    await workspace.ConfigurePlugin({ suppressConfigNotFoundError: false });
                    Assert.ok(eslintConfigErrorDetector(await workspace.AnalyzeCode(correctCode)));
                });

            test(
                "Checking whether `tsconfig.json`-files have a higher priority than the configuration…",
                async function()
                {
                    let workspace = await tester.CreateTemporaryWorkspace(
                        null,
                        {
                            ignoreJavaScript: false
                        });

                    this.timeout(40 * 1000);
                    this.slow(20 * 1000);
                    await tester.ConfigurePlugin({ ignoreJavaScript: true });
                    let response = await workspace.AnalyzeCode(ruleFailureCode, "JS");
                    Assert.ok(response.Filter(ruleName).length > 0);
                });
        });
}
