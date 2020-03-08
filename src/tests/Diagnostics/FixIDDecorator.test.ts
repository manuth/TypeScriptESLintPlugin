import Assert = require("assert");
import { FixIDDecorator } from "../../Diagnostics/FixIDDecorator";

suite(
    "FixIDDecorator",
    () =>
    {
        let decorator = new FixIDDecorator();
        let ruleId = "this/is-a-rule";

        suite(
            "Checking decorators…",
            () =>
            {
                let methods = [
                    decorator.DecorateFix,
                    decorator.DecorateCombinedFix,
                    decorator.DecorateDisableFix
                ];

                for (let method of methods)
                {
                    suite(`${method.name}(string fixId)`,
                        () =>
                        {
                            let decoratorMethod: typeof method;

                            suiteSetup(
                                () =>
                                {
                                    decoratorMethod = method.bind(decorator);
                                });

                            test(
                                "Checking whether rule-ids can be decorated…",
                                () =>
                                {
                                    Assert.ok(ruleId !== decoratorMethod(ruleId));
                                });
                        });
                }
            });

        suite(
            "Checking un-decorators…",
            () =>
            {
                let methodCollections = [
                    [decorator.DecorateFix, decorator.UndecorateFix],
                    [decorator.DecorateCombinedFix, decorator.UndecorateCombinedFix],
                    [decorator.DecorateDisableFix, decorator.UndecorateDisableFix]
                ];

                for (let methodCollection of methodCollections)
                {
                    suite(`${methodCollection[1].name}(string fixId)`,
                        () =>
                        {
                            let undecoratorMethod: typeof methodCollection[0];
                            let decoratorMethod: typeof methodCollection[1];

                            suiteSetup(
                                () =>
                                {
                                    undecoratorMethod = methodCollection[1].bind(decorator);
                                    decoratorMethod = methodCollection[0].bind(decorator);
                                });

                            test(
                                `Checking whether rule-ids generated using ${methodCollection[0].name} can be restored…`,
                                () =>
                                {
                                    Assert.ok(ruleId === undecoratorMethod(decoratorMethod(ruleId)));
                                });

                            test(
                                "Checking whether trying to undecorate a non-decorated rule-id causes an error…",
                                () =>
                                {
                                    Assert.throws(() => undecoratorMethod(ruleId));
                                });
                        });
                }
            });
    });
