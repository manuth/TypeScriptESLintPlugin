import { remove } from "fs-extra";
import { LanguageServiceTests } from "./LanguageService";
import { ESLintLanguageServiceTester } from "./LanguageService/ESLintLanguageServiceTester";
import { TestConstants } from "./TestConstants";

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
                    this.timeout(2 * 60 * 1000);
                    let tester = ESLintLanguageServiceTester.Default;
                    await tester.Install();
                });

            suiteTeardown(
                async function()
                {
                    this.timeout(15 * 1000);
                    await ESLintLanguageServiceTester.Default.Dispose();
                    await remove(TestConstants.TempWorkspaceDirectory);
                });

            setup(
                async function()
                {
                    this.timeout(15 * 1000);
                    await ESLintLanguageServiceTester.Default.ConfigurePlugin(TestConstants.Package.Name, {});
                    await ESLintLanguageServiceTester.Default.Configure();
                });

            LanguageServiceTests();
        });
}
