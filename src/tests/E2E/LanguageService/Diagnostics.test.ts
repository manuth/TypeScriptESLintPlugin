import Assert = require("assert");
import { LanguageServiceTester } from "./LanguageServiceTester";
import { TestWorkspace } from "./TestWorkspace";

/**
 * Registers tests for diagnostics.
 */
export function DiagnosticTests(): void
{
    suite(
        "Diagnostics",
        () =>
        {
            let tester: LanguageServiceTester;
            let workspace: TestWorkspace;
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
                    tester = LanguageServiceTester.Default;
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
                            Assert.strictEqual(response.Filter(commonRule).length, 1);
                        });
                });

            suite(
                "Fixables",
                () =>
                {
                    test(
                        "Checking whether fixable diagnostics provide code-fixes…",
                        async function()
                        {
                            this.timeout(8 * 1000);
                            this.slow(4 * 1000);
                            let fixesResponse = await workspace.GetCodeFixes(fixableCode, fixableRule);
                            Assert.ok(fixesResponse.Filter(tester.IDDecorator.DecorateFix(fixableRule)).length > 0);
                        });

                    test(
                        "Checking whether multiple fixable diagnostics can be fixed at once…",
                        async function()
                        {
                            this.timeout(8 * 1000);
                            this.slow(4 * 1000);
                            let fixesResponse = await workspace.GetCodeFixes(multipleFixableCode, fixableRule);
                            Assert.ok(fixesResponse.HasCombinedFix(tester.IDDecorator.DecorateCombinedFix(fixableRule)));
                        });

                    test(
                        "Checking whether all fixable diagnostics can be solved at once…",
                        async function()
                        {
                            this.timeout(8 * 1000);
                            this.slow(4 * 1000);
                            let fixesResponse = await workspace.GetCodeFixes(fixableCode, fixableRule);
                            Assert.ok(fixesResponse.Filter(tester.IDDecorator.DecorateFix("fix-all")).length > 0);
                        });

                    test(
                        "Checking whether code-actions for disabling eslint-rules are provided for fixable diagnostics…",
                        async function()
                        {
                            this.timeout(8 * 1000);
                            this.slow(4 * 1000);
                            let fixesResponse = await workspace.GetCodeFixes(fixableCode, fixableRule);
                            Assert.ok(fixesResponse.Filter(tester.IDDecorator.DecorateDisableFix(fixableRule)).length > 0);
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
                            this.timeout(8 * 1000);
                            this.slow(4 * 1000);
                            let fixesResponse = await workspace.GetCodeFixes(nonFixableCode, nonFixableRule);
                            Assert.strictEqual(fixesResponse.Filter(tester.IDDecorator.DecorateFix(nonFixableRule)).length, 0);
                        });

                    test(
                        "Checking whether non-fixable diagnostics don't provide a combined fix…",
                        async function()
                        {
                            this.timeout(8 * 1000);
                            this.slow(4 * 1000);
                            let fixesResponse = await workspace.GetCodeFixes(multipleNonfixableCode, nonFixableRule);
                            Assert.ok(!fixesResponse.HasCombinedFix(tester.IDDecorator.DecorateCombinedFix(nonFixableRule)));
                        });

                    test(
                        "Checking whether code-actions for disabling eslint-rules are provided for fixable diagnostics…",
                        async function()
                        {
                            this.timeout(8 * 1000);
                            this.slow(4 * 1000);
                            let fixesResponse = await workspace.GetCodeFixes(nonFixableCode, nonFixableRule);
                            Assert.ok(fixesResponse.Filter(tester.IDDecorator.DecorateDisableFix(nonFixableRule)).length > 0);
                        });
                });
        });
}
