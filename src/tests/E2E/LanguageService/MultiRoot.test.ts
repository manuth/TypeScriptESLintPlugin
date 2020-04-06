import Assert = require("assert");
import { LanguageServiceTester } from "./LanguageServiceTester";

suite(
    "Multi-Root",
    () =>
    {
        let tester: LanguageServiceTester;

        suiteSetup(
            () =>
            {
                tester = new LanguageServiceTester();
            });

        suiteTeardown(
            () =>
            {
                tester.Dispose();
            });

        test(
            "Checking whether files from foreign directories are processed correctly…",
            async function()
            {
                this.enableTimeouts(false);
                let charClassRule = "no-empty-character-class";
                let debuggerRule = "no-debugger";

                let code = `
                    debugger;
                    /abc[]/.test("abcd");`;

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
