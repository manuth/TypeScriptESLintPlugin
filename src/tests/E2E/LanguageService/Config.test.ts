import Assert = require("assert");
import { LanguageServiceTester } from "./LanguageServiceTester";
import { DiagnosticsResponseAnalyzer } from "./DiagnosticsResponseAnalyzer";

export = (tester: LanguageServiceTester): void =>
{
    suite(
        "Config",
        () =>
        {
            teardown(
                async () =>
                {
                    await tester.Configure({});
                });

            test(
                "Checking whether JavaScript can be ignored…",
                async function()
                {
                    this.enableTimeouts(false);
                    let code = 'console.log("Hello World");;;';
                    let diagnosticsResponse = await tester.AnalyzeCode(code, "JS");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    diagnosticsResponse = await tester.AnalyzeCode(code, "JSX");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    await tester.Configure({ ignoreJavaScript: true });
                    diagnosticsResponse = await tester.AnalyzeCode(code, "JS");
                    Assert.strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                    diagnosticsResponse = await tester.AnalyzeCode(code, "JSX");
                    Assert.strictEqual(diagnosticsResponse.Diagnostics.length, 0);
                });

            test(
                "Checking whether TypeScript can be ignored…",
                async function()
                {
                    this.enableTimeouts(false);
                    let code = 'console.log("Hello World")';
                    let diagnosticsResponse = await tester.AnalyzeCode(code, "TS");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    diagnosticsResponse = await tester.AnalyzeCode(code, "TSX");
                    Assert.ok(diagnosticsResponse.Diagnostics.length > 0);
                    await tester.Configure({ ignoreTypeScript: true });
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
                    this.enableTimeouts(false);
                    let response = await tester.AnalyzeCode(code);
                    Assert.strictEqual(response.Filter(ruleName).length, 0);
                    await tester.Configure({ allowInlineConfig: false });
                    response = await tester.AnalyzeCode(code);
                    Assert.ok(response.Filter(ruleName).length > 0);
                });

            test(
                "Checking whether the report of unused disable-directives can be disabled…",
                async function()
                {
                    this.enableTimeouts(false);
                    let code = "/* eslint-disable-next-line no-trailing-spaces */\n";

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
                    await tester.Configure({ reportUnusedDisableDirectives: false });
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

                    this.enableTimeouts(false);
                    let response = await tester.AnalyzeCode(code);
                    Assert.ok(response.Filter(emptyRule).length > 0);
                    Assert.strictEqual(response.Filter(nonEmptyRule).length, 0);

                    await tester.Configure(
                        {
                            useEslintrc: false,
                            configFile: tester.TSServer.MakePath("alternative.eslintrc.js")
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

                    let hasErrorLevel = (diagnostics: ts.server.protocol.Diagnostic[], errorLevel: string): boolean =>
                    {
                        return diagnostics.every((diagnostic) => diagnostic.category === errorLevel);
                    };

                    Assert.ok(hasErrorLevel((await tester.AnalyzeCode(code)).Filter(ruleName), "error"));
                    await tester.Configure({ alwaysShowRuleFailuresAsWarnings: true });
                    Assert.ok(hasErrorLevel((await tester.AnalyzeCode(code)).Filter(ruleName), "warning"));
                });

            test(
                "Checking whether eslint can be disabled when other errors are present…",
                async function()
                {
                    let code = "let x: Array<sting>;  ";
                    let ruleName = "no-trailing-spaces";
                    Assert.ok((await tester.AnalyzeCode(code)).Filter(ruleName).length > 0);
                    await tester.Configure({ suppressWhileTypeErrorsPresent: true });
                    Assert.strictEqual((await tester.AnalyzeCode(code)).Filter(ruleName).length, 0);
                });

            test(
                "Checking whether warnings about the use of deprecated rules can be suppressed…",
                async function()
                {
                    let code = 'console.log("this code is correct");\n';
                    let configFile = tester.TSServer.MakePath("deprecated.eslintrc.js");

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

                    this.enableTimeouts(false);
                    await tester.Configure({ configFile });
                    Assert.ok(deprecatedRuleDetector(await tester.AnalyzeCode(code)));
                    await tester.Configure({ configFile, suppressDeprecationWarnings: true });
                    Assert.ok(!deprecatedRuleDetector(await tester.AnalyzeCode(code)));
                });
        });
};
