import { copy } from "fs-extra";
import { ConfigTests } from "./Config.test";
import { DiagnosticTests } from "./Diagnostics.test";
import { GeneralTests } from "./General.test";
import { LanguageServiceTester } from "./LanguageServiceTester";
import { MultiRootTests } from "./MultiRoot.test";

/**
 * Registers tests for the language-service.
 */
export function LanguageServiceTests(): void
{
    suite(
        "Language-Service",
        () =>
        {
            suiteSetup(
                async function()
                {
                    this.timeout(0);
                    let tester = LanguageServiceTester.Default;
                    await tester.Initialize();

                    await tester.Configure(
                        {
                            "no-trailing-spaces": "off",
                            "prefer-const": "warn"
                        });

                    await copy(tester.MakePath(".eslintrc"), tester.MakePath("alternative.eslintrc"));

                    await tester.Configure(
                        {
                            "no-debugger": "off",
                            "no-trailing-spaces": "warn",
                            "no-empty-character-class": "warn",
                            "prefer-const": "off"
                        });
                });

            GeneralTests();
            MultiRootTests();
            DiagnosticTests();
            ConfigTests();
        });
}
