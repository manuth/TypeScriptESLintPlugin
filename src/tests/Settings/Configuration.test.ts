import { strictEqual } from "assert";
import { Random } from "random-js";
import { LogLevel } from "../../Logging/LogLevel";
import { Configuration } from "../../Settings/Configuration";
import { ITSConfiguration } from "../../Settings/ITSConfiguration";
import { PackageManager } from "../../Settings/PackageManager";

/**
 * Registers tests for the `Configuration` class.
 */
export function ConfigurationTests(): void
{
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
                "constructor",
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
                            strictEqual(config.IgnoreJavaScript, configValues.ignoreJavaScript);
                            strictEqual(config.AlwaysShowRuleFailuresAsWarnings, configValues.alwaysShowRuleFailuresAsWarnings);
                            strictEqual(config.SuppressWhileTypeErrorsPresent, configValues.suppressWhileTypeErrorsPresent);
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

                            strictEqual(config.PackageManager, packageManager);
                            strictEqual(config.LogLevel, logLevel);
                        });
                });
        });
}
