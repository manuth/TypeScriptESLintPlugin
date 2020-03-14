import Assert = require("assert");
import { Random } from "random-js";
import { LogLevel } from "../../Logging/LogLevel";
import { Configuration } from "../../Settings/Configuration";
import { ITSConfiguration } from "../../Settings/ITSConfiguration";
import { PackageManager } from "../../Settings/PackageManager";

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
            });
    });
