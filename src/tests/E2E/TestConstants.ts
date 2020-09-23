import { Package } from "@manuth/package-json-editor";
import { join } from "upath";

/**
 * Provides constants for the end-to-end tests.
 */
export class TestConstants
{
    /**
     * Gets the path to the directory of this package.
     */
    public static readonly PackageDirectory = join(__dirname, "..", "..", "..");

    /**
     * Gets the path whoch contains files for testing.
     */
    public static readonly TestDirectory = join(__dirname, "..", "..", "..", "test");

    /**
     * Gets the path to save temporary workspaces to.
     */
    public static readonly TempWorkspaceDirectory = join(TestConstants.TestDirectory, "temp-workspaces");

    /**
     * Gets the path to the project-directory.
     */
    public static readonly ProjectDirectory = join(TestConstants.TempWorkspaceDirectory, "main");

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
            this.package = new Package(join(this.PackageDirectory, "package.json"));
        }

        return this.package;
    }
}
