import { IInitializationOptions } from "./IInitializationOptions";
import ts = require("typescript/lib/tsserverlibrary");
import { PluginModule } from "./PluginModule";
import { Constants } from "./Constants";
import { Interceptor } from "./Interception/Interceptor";

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
