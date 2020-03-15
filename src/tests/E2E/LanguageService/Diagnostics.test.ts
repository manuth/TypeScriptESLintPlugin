import Assert = require("assert");
import { LanguageServiceTester } from "./LanguageServiceTester";

export = (tester: LanguageServiceTester): void =>
{
    suite(
        "Diagnostics",
        () =>
        {
            suite(
                "General",
                () =>
                {
                    test(
                        "Checking whether no error is reported if the file looks correct…",
                        async function()
                        {
                            this.enableTimeouts(false);
                            Assert.strictEqual((await tester.AnalyzeCode('console.log("this is a correct looking file");\n')).Diagnostics.length, 0);
                        });

                    test(
                        "Checking whether errors are reported…",
                        async function()
                        {
                            this.enableTimeouts(false);
                            let response = await tester.AnalyzeCode('let x = "hello world"; //who KnoWs how To formAt cOmmENts?\n');

                            Assert.strictEqual(response.Filter("spaced-comment").length, 1);
                            Assert.strictEqual(response.Filter("capitalized-comments").length, 1);
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
                            this.enableTimeouts(false);
                            let ruleName = "no-extra-semi";
                            let fixesResponse = await tester.GetCodeFixes('console.log("Hello World");;', ruleName);
                            Assert.ok(fixesResponse.Filter(tester.IDDecorator.DecorateFix(ruleName)).length > 0);
                        });

                    test(
                        "Checking whether multiple fixable diagnostics can be fixed at once…",
                        async function()
                        {
                            this.enableTimeouts(false);
                            let ruleName = "no-extra-semi";
                            let fixesResponse = await tester.GetCodeFixes(
                                `let name = "John";;
                                    console.log("Hello " + name);;`,
                                ruleName);

                            Assert.ok(fixesResponse.HasCombinedFix(tester.IDDecorator.DecorateCombinedFix(ruleName)));
                        });

                    test(
                        "Checking whether all fixable diagnostics can be solved at once…",
                        async function()
                        {
                            this.enableTimeouts(false);
                            let ruleName = "no-extra-semi";
                            let fixesResponse = await tester.GetCodeFixes(
                                `let name = "John";;
                                    console.log("Hello " + name);;`,
                                ruleName);

                            Assert.ok(fixesResponse.Filter(tester.IDDecorator.DecorateFix("fix-all")).length > 0);
                        });

                    test(
                        "Checking whether code-actions for disabling eslint-rules are provided for fixable diagnostics…",
                        async function()
                        {
                            this.enableTimeouts(false);
                            let ruleName = "no-trailing-spaces";
                            let fixesResponse = await tester.GetCodeFixes(
                                'console.log("Hello " + name);  ',
                                ruleName);

                            Assert.ok(fixesResponse.Filter(tester.IDDecorator.DecorateDisableFix(ruleName)).length > 0);
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
                            this.enableTimeouts(false);
                            let ruleName = "no-empty";
                            let fixesResponse = await tester.GetCodeFixes("if (true) { }", ruleName);
                            Assert.strictEqual(fixesResponse.Filter(tester.IDDecorator.DecorateFix(ruleName)).length, 0);
                        });

                    test(
                        "Checking whether non-fixable diagnostics don't provide a combined fix…",
                        async function()
                        {
                            this.enableTimeouts(false);
                            let ruleName = "no-empty";
                            let fixesResponse = await tester.GetCodeFixes(
                                `if (true) { }
                                    if (true) { }`,
                                ruleName);

                            Assert.ok(!fixesResponse.HasCombinedFix(tester.IDDecorator.DecorateCombinedFix(ruleName)));
                        });

                    test(
                        "Checking whether code-actions for disabling eslint-rules are provided for fixable diagnostics…",
                        async function()
                        {
                            this.enableTimeouts(false);
                            let ruleName = "no-empty";
                            let fixesResponse = await tester.GetCodeFixes(
                                "if (true) { }",
                                ruleName);

                            Assert.ok(fixesResponse.Filter(tester.IDDecorator.DecorateDisableFix(ruleName)).length > 0);
                        });
                });
        });
};
