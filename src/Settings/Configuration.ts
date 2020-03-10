import { isUndefined } from "util";
import { LogLevel } from "../Logging/LogLevel";
import { ITSConfiguration } from "./ITSConfiguration";
import { PackageManager } from "./PackageManager";

/**
 * Represents settings for the plugin.
 */
export class Configuration
{
    /**
     * Gets or sets a value indicating whether JavaScript-files should be ignored.
     */
    public IgnoreJavaScript: boolean;

    /**
     * Gets or sets a value indicating whether failures always should be considered as warnings.
     */
    public AlwaysShowRuleFailuresAsWarnings: boolean;

    /**
     * Gets or sets a value indicating whether errors of this plugin should be suppressed while other errors are present.
     */
    public SuppressWhileTypeErrorsPresent: boolean;

    /**
     * Gets or sets a value indicating whether warnings about deprecated rules should be suppressed.
     */
    public SuppressDeprecationWarnings: boolean;

    /**
     * Gets or sets a list of files to exclude.
     */
    public Exclude: string[];

    /**
     * Gets or sets the package-manager for recommending correct commands.
     */
    public PackageManager: PackageManager;

    /**
     * Gets or sets the log-level that should be piped to the `info`-channel.
     */
    public LogLevel: LogLevel;

    /**
     * Initializes a new instance of the `Configuration` class.
     *
     * @param config
     * The `json`-flavored representation of the configuration.
     */
    public constructor(config?: ITSConfiguration)
    {
        config = {
            ...{
                ignoreJavaScript: false,
                alwaysShowRuleFailuresAsWarnings: false,
                suppressWhileTypeErrorsPresent: false,
                suppressDeprecationWarnings: false,
                exclude: []
            },
            ...config
        };

        this.IgnoreJavaScript = config.ignoreJavaScript;
        this.AlwaysShowRuleFailuresAsWarnings = config.alwaysShowRuleFailuresAsWarnings;
        this.SuppressWhileTypeErrorsPresent = config.suppressWhileTypeErrorsPresent;
        this.SuppressDeprecationWarnings = config.suppressDeprecationWarnings;
        this.Exclude = config.exclude;
        this.PackageManager = this.ParseEnumConfig<PackageManager>(config.packageManager, PackageManager, PackageManager.NPM);
        this.LogLevel = this.ParseEnumConfig<LogLevel>(config.logLevel, LogLevel, LogLevel.Info);
    }

    /**
     * Parses an enum-setting.
     *
     * @param setting
     * The setting to parse.
     *
     * @param enumDeclaration
     * The enum to parse.
     *
     * @param defaultValue
     * The default value.
     */
    protected ParseEnumConfig<T>(setting: string, enumDeclaration: { [key: string]: string & T }, defaultValue: T): T
    {
        let result: T;

        if (
            !isUndefined(setting) &&
            Object.keys(enumDeclaration).includes(setting))
        {
            result = enumDeclaration[setting];
        }
        else
        {
            result = defaultValue;
        }

        return result;
    }
}
