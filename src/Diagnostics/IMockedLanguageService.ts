import ts = require("typescript/lib/tsserverlibrary");
import { Constants } from "../Constants";

/**
 * Represents a language service with the mock installed.
 */
export interface IMockedLanguageService extends ts.LanguageService
{
    /**
     * A value indicating whether the plugin has been installed.
     */
    [Constants.PluginInstalledSymbol]?: boolean;
}
