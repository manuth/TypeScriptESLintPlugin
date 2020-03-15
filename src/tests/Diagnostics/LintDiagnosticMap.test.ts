import Assert = require("assert");
import { Random } from "random-js";
import { ILintDiagnostic } from "../../Diagnostics/ILintDiagnostic";
import { LintDiagnosticMap } from "../../Diagnostics/LintDiagnosticMap";

suite(
    "LintDiagnosticMap",
    () =>
    {
        let lintDiagnosticMap: LintDiagnosticMap;

        setup(
            () =>
            {
                lintDiagnosticMap = new LintDiagnosticMap();
            });

        suite(
            "Set(number start, number end, ILintDiagnostic diagnostic)",
            () =>
            {
                test(
                    "Checking whether diagnostic can be added…",
                    () =>
                    {
                        Assert.doesNotThrow(
                            () =>
                            {
                                lintDiagnosticMap.Set(12, 20, {} as any);
                            });
                    });
            });

        suite(
            "Get(number start, number end)",
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

                        Assert.strictEqual(lintDiagnosticMap.Get(start, end), lintDiagnostic);
                    });
            });

        suite(
            "Values()",
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

                        Assert.strictEqual(Array.from(lintDiagnosticMap.Values()).length, count);
                    });
            });
    });
