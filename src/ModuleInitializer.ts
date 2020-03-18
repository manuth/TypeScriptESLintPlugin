import { IInitializationOptions } from "./IInitializationOptions";
import ts = require("typescript/lib/tsserverlibrary");
import { PluginModule } from "./PluginModule";

/**
 * Provides the functionality to initialize new `PluginModule`s.
 */
export class ModuleInitializer
{
    /**
     * Initializes a new instance of the `ModuleInitializer`-class.
     */
    public constructor()
    { }

    /**
     * Initializes a new module.
     */
    public Initialize({ typescript }: IInitializationOptions): ts.server.PluginModule
    {
        if (this.IsValidTypeScriptVersion(typescript))
        {
            return new PluginModule(typescript);
        }
        else
        {
            return {
                create(pluginCreateInfo): ts.LanguageService
                {
                    return pluginCreateInfo.languageService;
                }
            };
        }
    }

    /**
     * Checks whether the required `typescript`-version is satisfied.
     *
     * @param typescript
     * The `typescript`-server to check.
     *
     * @returns
     * A value indicating whether the typescript-version is valid.
     */
    protected IsValidTypeScriptVersion(typescript: typeof ts): boolean
    {
        const [major] = typescript.version.split(".");
        return parseInt(major, 10) >= 3;
    }
}
