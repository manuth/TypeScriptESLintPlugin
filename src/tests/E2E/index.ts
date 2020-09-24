import { copy } from "fs-extra";
import { LanguageServiceTests } from "./LanguageService";
import { LanguageServiceTester } from "./LanguageService/LanguageServiceTester";
import { TSServerTests } from "./TSServer.test";

/**
 * Registers end-to-end tests.
 */
export function EndToEndTests(): void
{
    suite(
        "End-to-End Tests",
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

            TSServerTests();
            LanguageServiceTests();
        });
}
