import type ts = require("typescript/lib/tsserverlibrary");

/**
 * Provides options for initializing this plugin.
 */
export interface IInitializationOptions
{
    /**
     * The server-library of typescript.
     */
    typescript: typeof ts;
}
