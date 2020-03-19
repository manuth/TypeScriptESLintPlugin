import ts = require("typescript/lib/tsserverlibrary");
import { Constants } from "./Constants";
import { IInitializationOptions } from "./IInitializationOptions";
import { Interceptor } from "./Interception/Interceptor";
import { PluginModule } from "./PluginModule";

/**
 * Provides the functionality to initialize new `PluginModule`s.
 */
export class ModuleInitializer
{
    /**
     * A set of typescript-servers and their associated plugin-module.
     */
    private pluginModules: Map<typeof ts, ts.server.PluginModule> = new Map();

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
            if (!this.pluginModules.has(typescript))
            {
                this.pluginModules.set(typescript, new PluginModule(typescript));
            }

            return this.pluginModules.get(typescript);
        }
        else
        {
            return {
                create(createInfo): ts.LanguageService
                {
                    let interceptor = new Interceptor(createInfo.languageService, true);
                    interceptor.AddMethod(
                        "getSemanticDiagnostics",
                        (target, delegate, fileName) =>
                        {
                            let diagnostics = delegate(fileName);

                            diagnostics.push(
                                {
                                    source: Constants.ErrorSource,
                                    code: Constants.ErrorCode,
                                    category: ts.DiagnosticCategory.Error,
                                    file: target.getProgram().getSourceFile(fileName),
                                    start: 0,
                                    length: 0,
                                    messageText: "Invalid TypeScript version detected. The `typescript-eslint-plugin` requires TypeScript 3.0 or higher."
                                });

                            return diagnostics;
                        });

                    interceptor.AddMethod(
                        "dispose",
                        (target, delegate) =>
                        {
                            interceptor.Dispose();
                            delegate();
                        });

                    return createInfo.languageService;
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