import { LanguageServiceTests } from "./LanguageService";
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
            TSServerTests();
            LanguageServiceTests();
        });
}
