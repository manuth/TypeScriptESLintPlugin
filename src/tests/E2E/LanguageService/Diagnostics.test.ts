import Assert = require("assert");
import { FixResponseAnalyzer } from "@manuth/typescript-languageservice-tester";
import { ESLintLanguageServiceTester } from "./ESLintLanguageServiceTester";
import { ESLintWorkspace } from "./ESLintWorkspace";

/**
 * Registers tests for diagnostics.
 */
export function DiagnosticTests(): void
{
    suite(
        "Diagnostics",
        () =>
        {
            let tester: ESLintLanguageServiceTester;
            let workspace: ESLintWorkspace;
            let correctCode: string;
            let commonRule: string;
            let commonCode: string;
            let fixableRule: string;
            let fixableCode: string;
            let multipleFixableCode: string;
            let nonFixableRule: string;
            let nonFixableCode: string;
            let multipleNonfixableCode: string;

            suiteSetup(
                async () =>
                {
                    tester = ESLintLanguageServiceTester.Default;
                    correctCode = "";
                    commonRule = "spaced-comment";
                    commonCode = 'let x = "hello world"; //who KnoWs how To formAt cOmmENts?\n';
                    fixableRule = "@typescript-eslint/no-extra-semi";
                    fixableCode = 'console.log("Hello World");;';

                    multipleFixableCode = `
                        ${fixableCode}
                        ${fixableCode}`;

                    nonFixableRule = "no-empty";
                    nonFixableCode = "if (true) { }";

                    multipleNonfixableCode = `
                        ${nonFixableCode}
                        ${nonFixableCode}`;

                    workspace = await tester.CreateTemporaryWorkspace(
                        {
                            [commonRule]: "warn",
                            [fixableRule]: "warn",
                            [nonFixableRule]: "warn"
                        });
                });

            suite(
                "General",
                () =>
                {
                    test(
                        "Checking whether no error is reported if the file looks correct…",
                        async function()
                        {
                            this.timeout(25 * 1000);
                            this.slow(12.5 * 1000);
                            let response = await workspace.AnalyzeCode(correctCode);
                            Assert.strictEqual(response.Diagnostics.length, 0);
                        });

                    test(
                        "Checking whether errors are reported…",
                        async function()
                        {
                            this.timeout(8 * 1000);
                            this.slow(4 * 1000);
                            let response = await workspace.AnalyzeCode(commonCode);
                            Assert.strictEqual(response.FilterRule(commonRule).length, 1);
                        });
                });

            suite(
                "Code-Fixes",
                () =>
                {
                    /**
                     * Gets the code-fixes for all diagnostics of the specified rule.
                     *
                     * @param code
                     * The code to check.
                     *
                     * @param rule
                     * The name of the rule to get fixes for.
                     *
                     * @returns
                     * The responses to all code-fix requests.
                     */
                    async function GetFixes(code: string, rule: string): Promise<FixResponseAnalyzer[]>
                    {
                        let result = await Promise.all(
                            (await workspace.AnalyzeCode(code)).FilterRule(rule).map(
                                (diagnostic) =>
                                {
                                    return diagnostic.GetCodeFixes();
                                }));

                        return result;
                    }

                    /**
                     * Asserts the existence of a rule-fix.
                     *
                     * @param code
                     * The code to check.
                     *
                     * @param rule
                     * The rule to check fixes for.
                     *
                     * @param fixName
                     * The name of the fix whose existence is to be checked.
                     *
                     * @param exists
                     * A value indicating whether a fix with the specified name is expected to exist.
                     */
                    async function AssertRuleFix(code: string, rule: string, fixName: string, exists: boolean): Promise<void>
                    {
                        (await GetFixes(code, rule)).every((fixResponse) => fixResponse.HasFix(fixName) === exists);
                    }

                    /**
                     * Asserts the existence of a combined rule-fix.
                     *
                     * @param code
                     * The code to check.
                     *
                     * @param rule
                     * The rule to check fixes for.
                     *
                     * @param fixId
                     * The id of the combined fix whose existence is to be checked.
                     *
                     * @param exists
                     * A value indicating whether a fix with the specified name is expected to exist.
                     */
                    async function AssertCombinedRuleFix(code: string, rule: string, fixId: unknown, exists: boolean): Promise<void>
                    {
                        (await GetFixes(code, rule)).every((fixResponse) => fixResponse.HasCombinedFix(fixId) === exists);
                    }

                    suite(
                        "Fixables",
                        () =>
                        {
                            test(
                                "Checking whether fixable diagnostics provide code-fixes…",
                                async function()
                                {
                                    this.timeout(20 * 1000);
                                    this.slow(10 * 1000);

                                    await AssertRuleFix(
                                        fixableCode,
                                        fixableRule,
                                        tester.IDDecorator.DecorateFix(fixableRule),
                                        true);
                                });

                            test(
                                "Checking whether multiple fixable diagnostics can be fixed at once…",
                                async function()
                                {
                                    this.timeout(20 * 1000);
                                    this.slow(10 * 1000);

                                    await AssertCombinedRuleFix(
                                        multipleFixableCode,
                                        fixableRule,
                                        tester.IDDecorator.DecorateCombinedFix(fixableRule),
                                        true);
                                });

                            test(
                                "Checking whether all fixable diagnostics can be solved at once…",
                                async function()
                                {
                                    this.timeout(20 * 1000);
                                    this.slow(10 * 1000);

                                    await AssertRuleFix(
                                        fixableCode,
                                        fixableRule,
                                        tester.IDDecorator.DecorateFix("fix-all"),
                                        true);
                                });

                            test(
                                "Checking whether code-actions for disabling eslint-rules are provided for fixable diagnostics…",
                                async function()
                                {
                                    this.timeout(20 * 1000);
                                    this.slow(10 * 1000);

                                    await AssertRuleFix(
                                        fixableCode,
                                        fixableRule,
                                        tester.IDDecorator.DecorateDisableFix(fixableRule),
                                        true);
                                });
                        });

                    suite(
                        "Non-Fixables",
                        () =>
                        {
                            test(
                                "Checking whether non-fixable diagnostics provide no code-fixes…",
                                async function()
                                {
                                    this.timeout(20 * 1000);
                                    this.slow(10 * 1000);

                                    await AssertRuleFix(
                                        nonFixableCode,
                                        nonFixableRule,
                                        tester.IDDecorator.DecorateFix(nonFixableRule),
                                        false);
                                });

                            test(
                                "Checking whether non-fixable diagnostics don't provide a combined fix…",
                                async function()
                                {
                                    this.timeout(20 * 1000);
                                    this.slow(10 * 1000);

                                    await AssertCombinedRuleFix(
                                        multipleNonfixableCode,
                                        nonFixableRule,
                                        tester.IDDecorator.DecorateFix(nonFixableRule),
                                        false);
                                });

                            test(
                                "Checking whether code-actions for disabling eslint-rules are provided for fixable diagnostics…",
                                async function()
                                {
                                    this.timeout(20 * 1000);
                                    this.slow(10 * 1000);

                                    await AssertRuleFix(
                                        nonFixableCode,
                                        nonFixableRule,
                                        tester.IDDecorator.DecorateDisableFix(nonFixableRule),
                                        true);
                                });
                        });
                });
        });
}
