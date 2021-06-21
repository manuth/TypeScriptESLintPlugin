import type { LanguageService } from "typescript/lib/tsserverlibrary";
import { Constants } from "../Constants";

/**
 * Represents a language service with the mock installed.
 */
export interface IMockedLanguageService extends LanguageService
{
    /**
     * A value indicating whether the plugin has been installed.
     */
    [Constants.PluginInstalledSymbol]?: boolean;

    /**
     * A value indicating whether the plugin has been installed.
     */
    [Constants.PluginInstalledDescription]?(): boolean;
}
