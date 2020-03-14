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
     * Gets or sets a list of files to exclude.
     */
    readonly exclude?: string[];

    /**
     * Gets or sets the name of the package-manager for recommending correct commands.
     */
    readonly packageManager?: string;

    /**
     * Gets or sets the log-level that should be piped to the `info`-channel.
     */
    readonly logLevel?: string;
}
