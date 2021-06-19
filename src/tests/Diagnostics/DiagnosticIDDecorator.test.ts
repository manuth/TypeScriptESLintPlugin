import { ok, throws } from "assert";
import { DiagnosticIDDecorator } from "../../Diagnostics/DiagnosticIDDecorator";

/**
 * Registers tests for the {@link DiagnosticIDDecorator `DiagnosticIDDecorator`} class.
 */
export function DiagnosticIDDecoratorTests(): void
{
    suite(
        "DiagnosticIDDecorator",
        () =>
        {
            let decorator = new DiagnosticIDDecorator();
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
                        suite(`${method.name}`,
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
                                        ok(ruleId !== decoratorMethod(ruleId));
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
                        suite(`${methodCollection[1].name}`,
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
                                        ok(ruleId === undecoratorMethod(decoratorMethod(ruleId)));
                                    });

                                test(
                                    "Checking whether trying to undecorate a non-decorated rule-id causes an error…",
                                    () =>
                                    {
                                        throws(() => undecoratorMethod(ruleId));
                                    });
                            });
                    }
                });
        });
}
