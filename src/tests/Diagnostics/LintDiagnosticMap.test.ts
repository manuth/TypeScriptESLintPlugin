import { doesNotThrow, strictEqual } from "assert";
import { Random } from "random-js";
import { ILintDiagnostic } from "../../Diagnostics/ILintDiagnostic";
import { LintDiagnosticMap } from "../../Diagnostics/LintDiagnosticMap";

/**
 * Registers tests for the {@link LintDiagnosticMap `LintDiagnosticMap`} class.
 */
export function LintDiagnosticMapTests(): void
{
    suite(
        nameof(LintDiagnosticMap),
        () =>
        {
            let lintDiagnosticMap: LintDiagnosticMap;

            setup(
                () =>
                {
                    lintDiagnosticMap = new LintDiagnosticMap();
                });

            suite(
                nameof<LintDiagnosticMap>((map) => map.Values),
                () =>
                {
                    test(
                        "Checking whether values can be queried correctly…",
                        () =>
                        {
                            let count = new Random().integer(0, 10);

                            for (let i = 0; i < count; i++)
                            {
                                lintDiagnosticMap.Set(i, i, {} as ILintDiagnostic);
                            }

                            strictEqual(Array.from(lintDiagnosticMap.Values).length, count);
                        });
                });

            suite(
                nameof<LintDiagnosticMap>((map) => map.Set),
                () =>
                {
                    test(
                        "Checking whether diagnostic can be added…",
                        () =>
                        {
                            doesNotThrow(
                                () =>
                                {
                                    lintDiagnosticMap.Set(12, 20, {} as any);
                                });
                        });
                });

            suite(
                nameof<LintDiagnosticMap>((map) => map.Get),
                () =>
                {
                    test(
                        "Checking whether lint-diagnostics can be queried…",
                        () =>
                        {
                            let start = 20;
                            let end = 2234;
                            let lintDiagnostic = {} as ILintDiagnostic;
                            lintDiagnosticMap.Set(start, end, lintDiagnostic);

                            strictEqual(lintDiagnosticMap.Get(start, end), lintDiagnostic);
                        });
                });
        });
}
