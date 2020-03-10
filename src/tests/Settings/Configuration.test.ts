import Assert = require("assert");
import { ITSConfiguration } from "../../Settings/ITSConfiguration";
import { Random } from "random-js";
import { Configuration } from "../../Settings/Configuration";
import { PackageManager } from "../../Settings/PackageManager";
import { LogLevel } from "../../Logging/LogLevel";

suite(
    "Configuration",
    () =>
    {
        let random: Random;

        suiteSetup(
            () =>
            {
                random = new Random();
            });

        suite(
            "constructor(ITSConfiguration config)",
            () =>
            {
                let configValues: ITSConfiguration;
                let config: Configuration;

                suiteSetup(
                    () =>
                    {
                        configValues = {
                            ignoreJavaScript: random.bool(),
                            alwaysShowRuleFailuresAsWarnings: random.bool(),
                            exclude: [
                                ...new Array(random.integer(0, 10)).map(() => random.string(5))
                            ],
                            suppressWhileTypeErrorsPresent: random.bool()
                        };
                    });

                setup(
                    () =>
                    {
                        config = new Configuration(configValues);
                    });

                test(
                    "Checking whether literals literals are interpreted correctly…",
                    () =>
                    {
                        Assert.strictEqual(config.IgnoreJavaScript, configValues.ignoreJavaScript);
                        Assert.strictEqual(config.AlwaysShowRuleFailuresAsWarnings, configValues.alwaysShowRuleFailuresAsWarnings);
                        Assert.ok(configValues.exclude.every((value) => config.Exclude.includes(value)));
                        Assert.strictEqual(config.SuppressWhileTypeErrorsPresent, configValues.suppressWhileTypeErrorsPresent);
                    });

                test(
                    "Checking whether enum-values are interpreted correctly…",
                    () =>
                    {
                        let packageManager = PackageManager.Yarn;
                        let logLevel = LogLevel.Verbose;

                        let config = new Configuration(
                            {
                                packageManager,
                                logLevel
                            });

                        Assert.strictEqual(config.PackageManager, packageManager);
                        Assert.strictEqual(config.LogLevel, logLevel);
                    });

                test(
                    "Checking whether an error is thrown if an incorrect enum-value is supplied…",
                    () =>
                    {

                    });
            });
    });