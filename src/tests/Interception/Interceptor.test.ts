import Assert = require("assert");
import { Random } from "random-js";
import { Interceptor } from "../../Interception/Interceptor";
import { MethodInterception } from "../../Interception/MethodInterceptor";

/**
 * Registers tests for the `Interceptor` class.
 */
export function InterceptorTests(): void
{
    suite(
        "Interceptor",
        () =>
        {
            /**
             * The replacement for the method.
             *
             * @returns
             * A value.
             */
            let methodReplacement = (): number => 10 + 20;

            let random = new Random();
            let propertyName = "a" as const;
            let untouchedPropertyName = "b" as const;
            let methodName = "x" as const;
            let untouchedMethodName = "y" as const;
            let propertyReplacement = 10;

            let target = {
                [propertyName]: random.integer(1, 10),
                [untouchedPropertyName]: random.integer(1, 10),
                [methodName]: (): number => 198,
                [untouchedMethodName]: (): number => 387
            };

            let interceptor: Interceptor<typeof target>;

            setup(
                () =>
                {
                    if (interceptor)
                    {
                        for (let key of Array.from(interceptor.Interceptions.keys()))
                        {
                            interceptor.Delete(key);
                        }
                    }
                });

            suite(
                "constructor",
                () =>
                {
                    test(
                        "Checking whether the constructor can be invoked without errorsa…",
                        () =>
                        {
                            Assert.doesNotThrow(() => { interceptor = new Interceptor(target); });
                        });
                });

            suite(
                "Target",
                () =>
                {
                    test(
                        "Checking whether the target can be queried…",
                        () =>
                        {
                            Assert.strictEqual(target, interceptor.Target);
                        });
                });

            suite(
                "Interceptions",
                () =>
                {
                    test(
                        "Checking whether the interceptions can be queried…",
                        () =>
                        {
                            Assert.doesNotThrow(
                                () =>
                                {
                                    for (let { } of interceptor.Interceptions) { }
                                });
                        });
                });

            suite(
                "AddProperty",
                () =>
                {
                    test(
                        "Checking whether property-interceptions can be added…",
                        () =>
                        {
                            Assert.doesNotThrow(
                                () =>
                                {
                                    interceptor.AddProperty(
                                        propertyName,
                                        () =>
                                        {
                                            return propertyReplacement;
                                        });
                                });

                            Assert.ok(interceptor.Interceptions.has(propertyName));
                        });

                    test(
                        "Checking whether adding duplicate property-interceptions throws an error…",
                        () =>
                        {
                            interceptor.AddProperty(propertyName, null);
                            Assert.throws(() => interceptor.AddProperty(propertyName, null), RangeError);
                        });
                });

            suite(
                "AddMethod",
                () =>
                {
                    test(
                        "Checking whether property-interceptions can be added…",
                        () =>
                        {
                            Assert.doesNotThrow(
                                () =>
                                {
                                    interceptor.AddMethod(
                                        methodName,
                                        () =>
                                        {
                                            return methodReplacement();
                                        });
                                });

                            Assert.ok(interceptor.Interceptions.has(methodName));
                        });
                });

            suite(
                "Delete",
                () =>
                {
                    test(
                        "Checking whether interceptions can be deleted…",
                        () =>
                        {
                            for (let key of [propertyName, methodName])
                            {
                                Assert.doesNotThrow(
                                    () =>
                                    {
                                        interceptor.Delete(key);
                                    });

                                Assert.ok(!interceptor.Interceptions.has(key));
                            }
                        });
                });

            suite(
                "Proxy",
                () =>
                {
                    let proxy: typeof target;

                    suite(
                        "General",
                        () =>
                        {
                            test(
                                "Checking whether a proxy-object can be created…",
                                () =>
                                {
                                    proxy = interceptor.Proxy;
                                });
                        });

                    suite(
                        "Properties",
                        () =>
                        {
                            test(
                                "Checking whether properties are intercepted correctly…",
                                () =>
                                {
                                    interceptor.AddProperty(propertyName, () => propertyReplacement);
                                    Assert.strictEqual(proxy[propertyName], propertyReplacement);
                                });

                            test(
                                "Checking whether untouched properties can be queried…",
                                () =>
                                {
                                    Assert.strictEqual(proxy[untouchedPropertyName], target[untouchedPropertyName]);
                                });

                            test(
                                "Checking whether properties can be manipulated using interceptions…",
                                () =>
                                {
                                    /**
                                     * Manipulates the value.
                                     *
                                     * @param value
                                     * The value to manipulate.
                                     *
                                     * @returns
                                     * The manipulated value.
                                     */
                                    let manipulator = (value: number): number =>
                                    {
                                        return (value ** value) * 7 - value * 20;
                                    };

                                    interceptor.AddProperty(
                                        propertyName,
                                        (target, property) =>
                                        {
                                            return manipulator(target[property]);
                                        });

                                    Assert.strictEqual(proxy[propertyName], manipulator(target[propertyName]));
                                });
                        });

                    suite(
                        "Methods",
                        () =>
                        {
                            test(
                                "Checking whether methods are intercepted correctly…",
                                () =>
                                {
                                    interceptor.AddMethod(
                                        methodName,
                                        () =>
                                        {
                                            return methodReplacement();
                                        });

                                    Assert.strictEqual(proxy[methodName](), methodReplacement());
                                });

                            test(
                                "Checking whether untouched methods can be executed…",
                                () =>
                                {
                                    Assert.strictEqual(proxy[untouchedMethodName](), target[untouchedMethodName]());
                                });

                            test(
                                "Checking whether methods can be manipulated using interceptions…",
                                () =>
                                {
                                    let originalMethod = target[methodName];

                                    /**
                                     * Manipulates a method.
                                     *
                                     * @param targetObject
                                     * The object to execute the manipulator on.
                                     *
                                     * @param delegate
                                     * The original method.
                                     *
                                     * @returns
                                     * The manipulated value.
                                     */
                                    let manipulator = (targetObject: typeof target, delegate: typeof originalMethod): number =>
                                    {
                                        return delegate() + 870 * Object.keys(targetObject).length;
                                    };

                                    interceptor.AddMethod(
                                        methodName,
                                        (target, delegate) =>
                                        {
                                            return manipulator(target, delegate);
                                        });

                                    Assert.strictEqual(proxy[methodName](), manipulator(target, target[methodName]));
                                });

                            test(
                                "Checking whether arguments can be used correctly…",
                                () =>
                                {
                                    let testMethodName = "test" as const;
                                    let testArg = random.int32();

                                    let testTarget = {
                                        /**
                                         * A test-method.
                                         *
                                         * @param testArg
                                         * A test-argument.
                                         *
                                         * @returns
                                         * A value.
                                         */
                                        [testMethodName](testArg: number): number
                                        {
                                            return (testArg * 7 + 28) / 6;
                                        }
                                    };

                                    let testInterceptor = new Interceptor(testTarget);

                                    /**
                                     * A manipulator.
                                     *
                                     * @param target
                                     * The target of the manipulator.
                                     *
                                     * @param delegate
                                     * The original method.
                                     *
                                     * @param args
                                     * The passed arguments.
                                     *
                                     * @returns
                                     * A value.
                                     */
                                    let manipulator: MethodInterception<typeof testTarget, typeof testMethodName> = (target, delegate, ...args) =>
                                    {
                                        return args[0] * 80 / 28;
                                    };

                                    testInterceptor.AddMethod(testMethodName, manipulator);
                                    Assert.strictEqual(testInterceptor.Proxy[testMethodName](testArg), manipulator(testTarget, testTarget[testMethodName], testArg));
                                });
                        });
                });
        });
}
