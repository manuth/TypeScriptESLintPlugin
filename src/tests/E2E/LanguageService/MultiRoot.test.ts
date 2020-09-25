import Assert = require("assert");
import { LanguageServiceTester } from "./LanguageServiceTester";

/**
 * Registers tests for multi-root environments.
 */
export function MultiRootTests(): void
{
    suite(
        "Multi-Root",
        () =>
        {
            let tester: LanguageServiceTester;

            suiteSetup(
                () =>
                {
                    tester = LanguageServiceTester.Default;
                });

            test(
                "Checking whether files from foreign directories are processed correctly…",
                async function()
                {
                    this.timeout(0);
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
                    Assert.ok(response.Filter(charClassRule).length > 0);
                    Assert.strictEqual(response.Filter(debuggerRule).length, 0);
                    response = await workspace.AnalyzeCode(code, "TS");
                    Assert.ok(response.Filter(debuggerRule).length > 0);
                    Assert.strictEqual(response.Filter(charClassRule).length, 0);
                });
        });
}
