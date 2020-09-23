import { LanguageServiceTests } from "./LanguageService";
import { PreparationTests } from "./Preparation.test";
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
            PreparationTests();
            TSServerTests();
            LanguageServiceTests();
        });
}
