import { remove } from "fs-extra";
import { LanguageServiceTests } from "./LanguageService";
import { LanguageServiceTester } from "./LanguageService/LanguageServiceTester";
import { TestConstants } from "./TestConstants";
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
                    this.timeout(2 * 60 * 1000);
                    let tester = LanguageServiceTester.Default;
                    await tester.Initialize();
                });

            suiteTeardown(
                async function()
                {
                    this.timeout(15 * 1000);
                    await LanguageServiceTester.Default.Dispose();
                    await remove(TestConstants.TempWorkspaceDirectory);
                });

            setup(
                async function()
                {
                    this.timeout(15 * 1000);
                    await LanguageServiceTester.Default.ConfigurePlugin({});
                    await LanguageServiceTester.Default.Configure();
                });

            TSServerTests();
            LanguageServiceTests();
        });
}
