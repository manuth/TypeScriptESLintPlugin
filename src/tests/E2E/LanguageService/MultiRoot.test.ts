import { ok, strictEqual } from "assert";
import { ESLintRule } from "@manuth/eslint-plugin-typescript";
import { ESLintLanguageServiceTester } from "./ESLintLanguageServiceTester";

/**
 * Registers tests for multi-root environments.
 */
export function MultiRootTests(): void
{
    suite(
        "Multi-Root",
        () =>
        {
            let tester: ESLintLanguageServiceTester;

            suiteSetup(
                () =>
                {
                    tester = ESLintLanguageServiceTester.Default;
                });

            test(
                "Checking whether files from foreign directories are processed correctly…",
                async function()
                {
                    this.timeout(5 * 60 * 1000);
                    this.slow(2.5 * 60 * 1000);
                    let trailingWhitespaceRule = ESLintRule.NoTrailingSpaces;
                    let debuggerRule = ESLintRule.NoDebugger;

                    let code = `
                        debugger;
                        console.log();  `;

                    await tester.Configure(
                        undefined,
                        {
                            [trailingWhitespaceRule]: "warn",
                            [debuggerRule]: "off"
                        });

                    let workspace = await tester.CreateTemporaryWorkspace(
                        {
                            [trailingWhitespaceRule]: "off",
                            [debuggerRule]: "warn"
                        });

                    let response = await tester.AnalyzeCode(code);
                    ok(response.FilterRule(trailingWhitespaceRule).length > 0);
                    strictEqual(response.FilterRule(debuggerRule).length, 0);
                    response = await workspace.AnalyzeCode(code, "TS");
                    ok(response.FilterRule(debuggerRule).length > 0);
                    strictEqual(response.FilterRule(trailingWhitespaceRule).length, 0);
                });
        });
}
