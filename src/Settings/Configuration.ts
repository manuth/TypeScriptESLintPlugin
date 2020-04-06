import { isUndefined } from "util";
import pick = require("lodash.pick");
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
        this.config = config;
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
     * Gets the package-manager for recommending correct commands.
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
        let defaultValue = LogLevel.Info;
        return this.ParseEnumConfig<LogLevel>(this.GetSetting("logLevel", defaultValue), LogLevel, defaultValue);
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

    /**
     * Gets a config-entry.
     *
     * @param key
     * The key of the property to get.
     *
     * @param defaultValue
     * The default value.
     */
    protected GetSetting<TKey extends keyof ITSConfiguration>(key: TKey, defaultValue: ITSConfiguration[TKey]): ITSConfiguration[TKey]
    {
        let result = this.PluginInfo?.config[key] ?? this.config[key] ?? defaultValue;
        return result;
    }
}
