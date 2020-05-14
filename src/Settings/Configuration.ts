import { isUndefined } from "util";
import pick = require("lodash.pick");
import { ConfigurationLogger } from "../Logging/ConfigurationLogger";
import { LogLevel } from "../Logging/LogLevel";
import { ConfigurationManager } from "./ConfigurationManager";
import { ITSConfiguration } from "./ITSConfiguration";
import { PackageManager } from "./PackageManager";

/**
 * Represents settings for the plugin.
 */
export class Configuration
{
    /**
     * The configuration.
     */
    private config: ITSConfiguration;

    /**
     * The configuration-manager of this configuration.
     */
    private configurationManager: ConfigurationManager;

    /**
     * Initializes a new instance of the `Configuration` class.
     *
     * @param config
     * The `json`-flavored representation of the configuration.
     *
     * @param configurationManager
     * The configuration-manager.
     */
    public constructor(config?: ITSConfiguration, configurationManager?: ConfigurationManager)
    {
        this.config = config ?? {};
        this.configurationManager = configurationManager;
    }

    /**
     * Gets a value indicating whether JavaScript-files should be ignored.
     */
    public get IgnoreJavaScript(): boolean
    {
        return this.GetSetting("ignoreJavaScript", false);
    }

    /**
     * Gets a value indicating whether TypeScript-files should be ignored.
     */
    public get IgnoreTypeScript(): boolean
    {
        return this.GetSetting("ignoreTypeScript", false);
    }

    /**
     * Gets a value indicating whether eslint-comments are allowed.
     */
    public get AllowInlineConfig(): boolean
    {
        return this.GetSetting("allowInlineConfig", true);
    }

    /**
     * Gets a value indicating whether unused "disabled"-directives should be reported.
     */
    public get ReportUnusedDisableDirectives(): boolean
    {
        return this.GetSetting("reportUnusedDisableDirectives", true);
    }

    /**
     * Gets a value indicating whether eslintrc-files should be respected.
     */
    public get UseESLintRC(): boolean
    {
        return this.GetSetting("useEslintrc", true);
    }

    /**
     * Gets the path to load the configuration from.
     */
    public get ConfigFile(): string
    {
        return this.GetSetting("configFile", undefined);
    }

    /**
     * Gets a value indicating whether failures always should be considered as warnings.
     */
    public get AlwaysShowRuleFailuresAsWarnings(): boolean
    {
        return this.GetSetting("alwaysShowRuleFailuresAsWarnings", false);
    }

    /**
     * Gets a value indicating whether errors of this plugin should be suppressed while other errors are present.
     */
    public get SuppressWhileTypeErrorsPresent(): boolean
    {
        return this.GetSetting("suppressWhileTypeErrorsPresent", false);
    }

    /**
     * Gets a value indicating whether warnings about deprecated rules should be suppressed.
     */
    public get SuppressDeprecationWarnings(): boolean
    {
        return this.GetSetting("suppressDeprecationWarnings", false);
    }

    /**
     * Gets the package-manager for loading global packages and providing command-recommendations.
     */
    public get PackageManager(): PackageManager
    {
        let defaultValue = PackageManager.NPM;
        return this.ParseEnumConfig<PackageManager>(this.GetSetting("packageManager", defaultValue), PackageManager, defaultValue);
    }

    /**
     * Gets the log-level that should be piped to the `info`-channel.
     */
    public get LogLevel(): LogLevel
    {
        let defaultValue = LogLevel.None;
        return this.GetLogLevel(this.GetSetting("logLevel", defaultValue), defaultValue);
    }

    /**
     * Gets information for the plugin.
     */
    protected get PluginInfo(): ts.server.PluginCreateInfo
    {
        return this.configurationManager?.PluginInfo;
    }

    /**
     * Returns a JSON-string representing this object.
     *
     * @returns
     * A JSON-string representing the configuration.
     */
    public ToJSON(): string
    {
        return JSON.stringify(
            pick<Configuration, keyof Configuration>(
                this,
                "IgnoreJavaScript",
                "IgnoreTypeScript",
                "AllowInlineConfig",
                "ReportUnusedDisableDirectives",
                "UseESLintRC",
                "ConfigFile",
                "AlwaysShowRuleFailuresAsWarnings",
                "SuppressWhileTypeErrorsPresent",
                "SuppressDeprecationWarnings",
                "PackageManager",
                "LogLevel")
        );
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
     *
     * @returns
     * The configured enum-value.
     */
    protected ParseEnumConfig<T>(setting: string, enumDeclaration: { [key: string]: string & T }, defaultValue: T): T
    {
        let result: T;

        if (
            !isUndefined(setting) &&
            Object.keys(enumDeclaration).some((key) => enumDeclaration[key] === setting))
        {
            result = setting as any;
        }
        else
        {
            result = defaultValue;
        }

        return result;
    }

    /**
     * Gets a config-entry.
     *
     * @param key
     * The key of the property to get.
     *
     * @param defaultValue
     * The default value.
     *
     * @returns
     * The configured setting.
     */
    protected GetSetting<TKey extends keyof ITSConfiguration>(key: TKey, defaultValue: ITSConfiguration[TKey]): ITSConfiguration[TKey]
    {
        /**
         * Resolves the plugin configuration-value.
         *
         * @returns
         * The plugin configuration-value.
         */
        let pluginConfigValue = (): any => this.PluginInfo?.config?.[key];

        /**
         * Resolves the runtime configuration-value.
         *
         * @returns
         * The runtime configuration-value.
         */
        let runtimeValue = (): any => this.config[key];

        let result = pluginConfigValue() ?? runtimeValue() ?? defaultValue;
        let logLevel = key === "logLevel" ? this.GetLogLevel(result, defaultValue as LogLevel) : this.LogLevel;

        if (logLevel !== LogLevel.None)
        {
            let logger = new ConfigurationLogger(logLevel, this.configurationManager.RealLogger, "Configuration");
            logger.Info(`Querying the \`${key}\`-setting…`);

            if (logLevel === LogLevel.Verbose)
            {
                logger.Verbose(`Plugin Configuration Value:  ${pluginConfigValue()}`);
                logger.Verbose(`Runtime Configuration Value: ${runtimeValue()}`);
                logger.Verbose(`Default Configuration Value: ${defaultValue}`);
            }

            logger.Info(`Result: ${result}`);
        }

        return result;
    }

    /**
     * Gets the log-level.
     *
     * @param configValue
     * The value specified in the configuration.
     *
     * @param defaultValue
     * The default configuration-value.
     *
     * @returns
     * The configured log-level.
     */
    protected GetLogLevel(configValue: string, defaultValue: LogLevel): LogLevel
    {
        return this.ParseEnumConfig<LogLevel>(configValue, LogLevel, defaultValue);
    }
}
