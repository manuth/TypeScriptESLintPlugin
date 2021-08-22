import { basename } from "path";
import { DiagnosticIDDecoratorTests } from "./DiagnosticIDDecorator.test";
import { LintDiagnosticMapTests } from "./LintDiagnosticMap.test";

/**
 * Registers tests for diagnostics.
 */
export function DiagnosticTests(): void
{
    suite(
        basename(__dirname),
        () =>
        {
            LintDiagnosticMapTests();
            DiagnosticIDDecoratorTests();
        });
}
