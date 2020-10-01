import { join } from "upath";

/**
 * Provides constants for the end-to-end tests.
 */
export class TestConstants
{
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
    public static readonly MainTestWorkspaceDirectory = join(TestConstants.TempWorkspaceDirectory, "main");
}
