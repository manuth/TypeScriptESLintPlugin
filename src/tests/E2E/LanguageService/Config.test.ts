import { ok, strictEqual } from "assert";
import { spawnSync } from "child_process";
import { Diagnostic } from "@manuth/typescript-languageservice-tester";
import { copy, pathExists, remove } from "fs-extra";
import npmWhich = require("npm-which");
import { Constants } from "../../..";
import { ESLintDiagnosticResponse } from "./ESLintDiagnosticResponse";
import { ESLintLanguageServiceTester } from "./ESLintLanguageServiceTester";

/**
 * Registers tests for the configuration of the plugin.
 */
export function ConfigTests(): void
{
    suite(
        "Config",
        () =>
        {
            let tester: ESLintLanguageServiceTester;
            let correctCode: string;
            let incorrectCode: string;
            let ruleFailureCode: string;
            let ruleName: string;
            let disableLineComment: string;

            suiteSetup(
                () =>
                {
                    tester = ESLintLanguageServiceTester.Default;
                    correctCode = "";
                    incorrectCode = "let x: sting";
                    ruleFailureCode = 'console.log("Hello World");  ';
                    ruleName = "no-trailing-spaces";
                    disableLineComment = `/* eslint-disable-next-line ${ruleName} */`;
                });

            suiteTeardown(
                async () =>
                {
                    await tester.ConfigurePlugin(Constants.Package.Name, {});
                    await tester.Configure();
                });

            setup(
                async function()
                {
                    this.timeout(4 * 1000);
                    await tester.ConfigurePlugin(Constants.Package.Name, {});
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
                    this.timeout(1.5 * 60 * 1000);
                    this.slow(45 * 1000);
                    let diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "JS");
                    ok(diagnosticsResponse.Diagnostics.length > 0);
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "JSX");
                    ok(diagnosticsResponse.Diagnostics.length > 0);
                    await tester.ConfigurePlugin(Constants.Package.Name, { ignoreJavaScript: true });
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "JS");
                    strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "JSX");
                    strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                });

            test(
                "Checking whether TypeScript can be ignored…",
                async function()
                {
                    this.timeout(1.5 * 60 * 1000);
                    this.slow(45 * 1000);
                    let diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "TS");
                    ok(diagnosticsResponse.Diagnostics.length > 0);
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "TSX");
                    ok(diagnosticsResponse.Diagnostics.length > 0);
                    await tester.ConfigurePlugin(Constants.Package.Name, { ignoreTypeScript: true });
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "TS");
                    strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                    diagnosticsResponse = await tester.AnalyzeCode(ruleFailureCode, "TSX");
                    strictEqual(diagnosticsResponse.Diagnostics.length, 0);
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
                    strictEqual(response.FilterRule(ruleName).length, 0);
                    await tester.ConfigurePlugin(Constants.Package.Name, { allowInlineConfig: false });
                    response = await tester.AnalyzeCode(code);
                    ok(response.FilterRule(ruleName).length > 0);
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
                    let disableDirectiveDetector = (response: ESLintDiagnosticResponse): boolean =>
                    {
                        return response.Diagnostics.some(
                            (diagnostic) =>
                            {
                                return /\Weslint-disable\W/.test(diagnostic.Message) &&
                                    /unused/i.test(diagnostic.Message);
                            });
                    };

                    ok(disableDirectiveDetector(await tester.AnalyzeCode(code)));
                    await tester.ConfigurePlugin(Constants.Package.Name, { reportUnusedDisableDirectives: false });
                    ok(!disableDirectiveDetector(await tester.AnalyzeCode(code)));
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
                    ok(response.FilterRule(altDisabledRule).length > 0);
                    strictEqual(response.FilterRule(altEnabledRule).length, 0);

                    await tester.ConfigurePlugin(
                        Constants.Package.Name,
                        {
                            useEslintrc: false,
                            configFile: tester.MakePath("alternative.eslintrc")
                        });

                    response = await tester.AnalyzeCode(code);
                    ok(response.FilterRule(altEnabledRule).length > 0);
                    strictEqual(response.FilterRule(altDisabledRule).length, 0);
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
                    let hasErrorLevel = (diagnostics: Diagnostic[], errorLevel: string): boolean =>
                    {
                        return diagnostics.every((diagnostic) => diagnostic.Category === errorLevel);
                    };

                    await tester.Configure({ [ruleName]: "error" });
                    ok(hasErrorLevel((await tester.AnalyzeCode(ruleFailureCode)).FilterRule(ruleName), "error"));
                    await tester.ConfigurePlugin(Constants.Package.Name, { alwaysShowRuleFailuresAsWarnings: true });
                    ok(hasErrorLevel((await tester.AnalyzeCode(ruleFailureCode)).FilterRule(ruleName), "warning"));
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
                    ok((await tester.AnalyzeCode(code)).FilterRule(ruleName).length > 0);
                    await tester.ConfigurePlugin(Constants.Package.Name, { suppressWhileTypeErrorsPresent: true });
                    strictEqual((await tester.AnalyzeCode(code)).FilterRule(ruleName).length, 0);
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
                    let deprecatedRuleDetector = (response: ESLintDiagnosticResponse): boolean =>
                    {
                        return response.Diagnostics.some(
                            (diagnostic) =>
                            {
                                return !(/\([a-z-]\)$/.test(diagnostic.Message)) &&
                                    /deprecated/i.test(diagnostic.Message);
                            });
                    };

                    this.timeout(30 * 1000);
                    this.slow(15 * 1000);
                    ok(deprecatedRuleDetector(await workspace.AnalyzeCode(correctCode)));
                    await tester.ConfigurePlugin(Constants.Package.Name, { suppressDeprecationWarnings: true });
                    ok(!deprecatedRuleDetector(await workspace.AnalyzeCode(correctCode)));
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
                    let eslintConfigErrorDetector = (response: ESLintDiagnosticResponse): boolean =>
                    {
                        return response.Diagnostics.some(
                            (diagnostic) =>
                            {
                                return diagnostic.Message.startsWith("No ESLint configuration found");
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

                    ok(!eslintConfigErrorDetector(await workspace.AnalyzeCode(correctCode)));
                    await tester.ConfigurePlugin(Constants.Package.Name, { suppressConfigNotFoundError: false });
                    ok(eslintConfigErrorDetector(await workspace.AnalyzeCode(correctCode)));
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
                    await tester.ConfigurePlugin(Constants.Package.Name, { ignoreJavaScript: true });
                    let response = await workspace.AnalyzeCode(ruleFailureCode, "JS");
                    ok(response.FilterRule(ruleName).length > 0);
                });
        });
}
