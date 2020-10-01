import { DiagnosticIDDecoratorTests } from "./DiagnosticIDDecorator.test";
import { LintDiagnosticMapTests } from "./LintDiagnosticMap.test";

/**
 * Registers tests for diagnostics.
 */
export function DiagnosticTests(): void
{
    suite(
        "Diagnostics",
        () =>
        {
            LintDiagnosticMapTests();
            DiagnosticIDDecoratorTests();
        });
}
