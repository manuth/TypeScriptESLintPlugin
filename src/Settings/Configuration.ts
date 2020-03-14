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
     * Gets or sets a value indicating whether TypeScript-files should be ignored.
     */
    public IgnoreTypeScript: boolean;

    /**
     * Gets or sets a value indicating whether eslint-comments are allowed.
     */
    public AllowInlineConfig: boolean;

    /**
     * Gets or sets a value indicating whether unused "disabled"-directives should be reported.
     */
    public ReportUnusedDisableDirectives: boolean;

    /**
     * Gets or sets a value indicating whether eslintrc-files should be respected.
     */
    public UseESLintRC: boolean;

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
                ignoreTypeScript: false,
                allowInlineConfig: true,
                reportUnusedDisableDirectives: true,
                useEslintrc: true,
                alwaysShowRuleFailuresAsWarnings: false,
                suppressWhileTypeErrorsPresent: false,
                suppressDeprecationWarnings: false
            },
            ...config
        };

        this.IgnoreJavaScript = config.ignoreJavaScript;
        this.IgnoreTypeScript = config.ignoreTypeScript;
        this.AllowInlineConfig = config.allowInlineConfig;
        this.ReportUnusedDisableDirectives = config.reportUnusedDisableDirectives;
        this.UseESLintRC = config.useEslintrc;
        this.AlwaysShowRuleFailuresAsWarnings = config.alwaysShowRuleFailuresAsWarnings;
        this.SuppressWhileTypeErrorsPresent = config.suppressWhileTypeErrorsPresent;
        this.SuppressDeprecationWarnings = config.suppressDeprecationWarnings;
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
