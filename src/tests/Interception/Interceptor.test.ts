import Assert = require("assert");
import { Random } from "random-js";
import { Interceptor } from "../../Interception/Interceptor";
import { MethodInterception } from "../../Interception/MethodInterceptor";

suite(
    "Interceptor",
    () =>
    {
        let random = new Random();
        let propertyName: "a" = "a";
        let untouchedPropertyName: "b" = "b";
        let methodName: "x" = "x";
        let untouchedMethodName: "y" = "y";
        let propertyReplacement = 10;
        let methodReplacement = (): number => 10 + 20;

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
            "constructor(T target)",
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
            "AddProperty(TKey key, PropertyInterception<T, TKey> interception)",
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
            "AddMethod(TKey key, MethodInterception<T, TKey> interception)",
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
            "Delete(keyof T key)",
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
                                let testMethodName: "test" = "test";
                                let testArg = random.int32();

                                let testTarget = {
                                    [testMethodName](testArg: number): number
                                    {
                                        return (testArg * 7 + 28) / 6;
                                    }
                                };

                                let testInterceptor = new Interceptor(testTarget);

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
