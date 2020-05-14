/**
 * Represents the plugin section in the `tsconfig.json` file.
 */
export interface ITSConfiguration
{
    /**
     * Gets or sets a value indicating whether JavaScript-files should be ignored.
     */
    readonly ignoreJavaScript?: boolean;

    /**
     * Gets or sets a value indicating whether TypeScript-files should be ignored.
     */
    readonly ignoreTypeScript?: boolean;

    /**
     * A value indicating whether eslint-comments are allowed.
     */
    readonly allowInlineConfig?: boolean;

    /**
     * A value indicating whether unused "disabled"-directives should be reported.
     */
    readonly reportUnusedDisableDirectives?: boolean;

    /**
     * A value indicating whether eslintrc-files should be respected.
     */
    readonly useEslintrc?: boolean;

    /**
     * Gets or sets the path to load the configuration from.
     */
    readonly configFile?: string;

    /**
     * Gets or sets a value indicating whether all failures always should be considered as warnings.
     */
    readonly alwaysShowRuleFailuresAsWarnings?: boolean;

    /**
     * Gets or sets a value indicating whether errors of this plugin should be suppressed while other errors are present.
     */
    readonly suppressWhileTypeErrorsPresent?: boolean;

    /**
     * Gets or sets a value indicating whether warnings about deprecated rules should be suppressed.
     */
    readonly suppressDeprecationWarnings?: boolean;

    /**
     * Gets or sets a value indicating whether errors about missing `.eslintrc`-files should be suppressed.
     */
    readonly suppressConfigNotFoundError?: boolean;

    /**
     * Gets the package-manager for loading global packages and providing command-recommendations.
     */
    readonly packageManager?: string;

    /**
     * Gets or sets the log-level that should be piped to the `info`-channel.
     */
    readonly logLevel?: string;
}
