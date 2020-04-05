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
                let code = `
                    debugger;
                    /abc[]/.test("abcd");`;

                this.enableTimeouts(false);
                let foreignFileName = tester.TSServer.MakePath("..", "workspace-2", "src", "typescript.ts");
                let charClassRule = "no-empty-character-class";
                let debuggerRule = "no-debugger";
                let response = await tester.AnalyzeCode(code);
                Assert.ok(response.Filter(charClassRule).length > 0);
                Assert.strictEqual(response.Filter(debuggerRule).length, 0);
                response = await tester.AnalyzeCode(code, "TS", foreignFileName);
                Assert.ok(response.Filter(debuggerRule).length > 0);
                Assert.strictEqual(response.Filter(charClassRule).length, 0);
            });
    });
