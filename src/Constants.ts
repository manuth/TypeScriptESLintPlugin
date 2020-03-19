/**
 * Provides constants for the plugin.
 */
export class Constants
{
    /**
     * Gets the name of the plugin.
     */
    public static readonly PluginName = "TypeScriptESLintPlugin";

    /**
     * A description for a symbol which indicates whether the plugin is installed.
     */
    public static readonly PluginInstalledDescription = "__typescriptEslintPluginInstalled__";

    /**
     * A symbol which indicates whether the plugin is installed.
     */
    public static readonly PluginInstalledSymbol: unique symbol = Symbol(Constants.PluginInstalledDescription);

    /**
     * Gets the name of the error-source.
     */
    public static readonly ErrorSource = "eslint";

    /**
     * Gets the error-number.
     */
    public static readonly ErrorCode = 1;

    /**
     * Gets the decorator for fix-ids.
     */
    public static readonly FixIdDecorator = "eslint";
}
