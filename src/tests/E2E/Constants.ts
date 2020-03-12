import { join } from "upath";

/**
 * Provides constants for the end-to-end tests.
 */
export class Constants
{
    /**
     * Gets the path to the project-directory.
     */
    public static readonly ProjectDirectory = join(__dirname, "..", "..", "..", "test", "workspace");
}
