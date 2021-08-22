import { Package } from "@manuth/package-json-editor";
import { join } from "upath";

/**
 * Provides constants for the plugin.
 */
export class Constants
{
    /**
     * Gets the path to the directory of this package.
     */
    public static readonly PackageDirectory = join(__dirname, "..");

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
     * Gets the name of the `eslint`-package.
     */
    public static readonly ESLintPackageName = "eslint";

    /**
     * Gets the name of the error-source.
     */
    public static get ErrorSource(): string
    {
        return this.ESLintPackageName;
    }

    /**
     * Gets the error-number.
     */
    public static readonly ErrorCode = 1;

    /**
     * Gets the decorator for fix-ids.
     */
    public static get FixIdDecorator(): string
    {
        return this.ESLintPackageName;
    }

    /**
     * An object which represents this package.
     */
    private static package: Package = null;

    /**
     * Gets an object which represents this package.
     */
    public static get Package(): Package
    {
        if (this.package === null)
        {
            this.package = new Package(join(this.PackageDirectory, Package.FileName));
        }

        return this.package;
    }
}
