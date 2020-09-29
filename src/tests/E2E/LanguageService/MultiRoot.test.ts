import Assert = require("assert");
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
                    this.timeout(3 * 60 * 1000);
                    this.slow(1.5 * 60 * 1000);
                    let charClassRule = "no-empty-character-class";
                    let debuggerRule = "no-debugger";

                    let code = `
                        debugger;
                        /abc[]/.test("abcd");`;

                    await tester.Configure(
                        {
                            [charClassRule]: "warn",
                            [debuggerRule]: "off"
                        });

                    let workspace = await tester.CreateTemporaryWorkspace(
                        {
                            [charClassRule]: "off",
                            [debuggerRule]: "warn"
                        });

                    let response = await tester.AnalyzeCode(code);
                    Assert.ok(response.FilterRule(charClassRule).length > 0);
                    Assert.strictEqual(response.FilterRule(debuggerRule).length, 0);
                    response = await workspace.AnalyzeCode(code, "TS");
                    Assert.ok(response.FilterRule(debuggerRule).length > 0);
                    Assert.strictEqual(response.FilterRule(charClassRule).length, 0);
                });
        });
}
