import { ConfigTests } from "./Config.test";
import { DiagnosticTests } from "./Diagnostics.test";
import { GeneralTests } from "./General.test";
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
            GeneralTests();
            MultiRootTests();
            DiagnosticTests();
            ConfigTests();
        });
}
