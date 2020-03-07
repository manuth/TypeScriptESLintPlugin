import TSServerLibrary = require("typescript/lib/tsserverlibrary");

/**
 * Provides options for initialilzing this plugin.
 */
export interface IInitializationOptions
{
    /**
     * The server-library of typescript.
     */
    typescript: typeof TSServerLibrary;
}
