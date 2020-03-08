import Assert = require("assert");
import { Random } from "random-js";
import { IProblem } from "../../Diagnostics/IProblem";
import { ProblemMap } from "../../Diagnostics/ProblemMap";

suite(
    "ProblemMap",
    () =>
    {
        let problemMap: ProblemMap;

        setup(
            () =>
            {
                problemMap = new ProblemMap();
            });

        suite(
            "Set(number start, number end, IProblem problem)",
            () =>
            {
                test(
                    "Checking whether problems can be added…",
                    () =>
                    {
                        Assert.doesNotThrow(
                            () =>
                            {
                                problemMap.Set(12, 20, {} as any);
                            });
                    });
            });

        suite(
            "Get(number start, number end)",
            () =>
            {
                test(
                    "Checking whether problems can be queried…",
                    () =>
                    {
                        let start = 20;
                        let end = 2234;
                        let problem = {} as IProblem;
                        problemMap.Set(start, end, problem);

                        Assert.strictEqual(problemMap.Get(start, end), problem);
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
                            problemMap.Set(i, i, {} as IProblem);
                        }

                        Assert.strictEqual(Array.from(problemMap.Values()).length, count);
                    });
            });
    });
