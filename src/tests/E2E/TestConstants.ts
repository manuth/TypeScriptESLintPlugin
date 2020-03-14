import ts = require("typescript/lib/tsserverlibrary");
import { join } from "upath";

/**
 * Provides constants for the end-to-end tests.
 */
export class TestConstants
{
    /**
     * Gets the path to the project-directory.
     */
    public static readonly ProjectDirectory = join(__dirname, "..", "..", "..", "test", "workspace");
}
