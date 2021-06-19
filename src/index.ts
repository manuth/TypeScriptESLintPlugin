import { server } from "typescript/lib/tsserverlibrary";
import { Constants as _Constants } from "./Constants";
import { ConfigNotFoundMessage as _ConfigNotFoundMessage } from "./Diagnostics/ConfigNotFoundMessage";
import { DeprecationMessage as _DeprecationMessage } from "./Diagnostics/DeprecationMessage";
import { Diagnostic as _Diagnostic } from "./Diagnostics/Diagnostic";
import { DiagnosticIDDecorator as _DiagnosticIDDecorator } from "./Diagnostics/DiagnosticIDDecorator";
import { DiagnosticMessage as _DiagnosticMessage } from "./Diagnostics/DiagnosticMessage";
import { ESLintDiagnostic as _ESLintDiagnostic } from "./Diagnostics/ESLintDiagnostic";
import { ESLintNotInstalledMessage as _ESLintNotInstalledMessage } from "./Diagnostics/ESLintNotInstalledMessage";
import { IDiagnostic as _IDiagnostic } from "./Diagnostics/IDiagnostic";
import { IMockedLanguageService as _IMockedLanguageService } from "./Diagnostics/IMockedLanguageService";
import { IParsedDiagnostic as _IParsedDiagnostic } from "./Diagnostics/IParsedDiagnostic";
import { IInitializationOptions as _IInitializationOptions } from "./IInitializationOptions";
import { LogLevel as _LogLevel } from "./Logging/LogLevel";
import { ModuleInitializer as _ModuleInitializer } from "./ModuleInitializer";
import { Plugin as _Plugin } from "./Plugin";
import { PluginModule as _PluginModule } from "./PluginModule";
import { ITSConfiguration as _ITSConfiguration } from "./Settings/ITSConfiguration";
import { PackageManager as _PackageManager } from "./Settings/PackageManager";

/**
 * The module-initializer.
 */
let initializer = new _ModuleInitializer();

/**
 * Initializes the module.
 *
 * @param options
 * The options for the plugin.
 *
 * @returns
 * The typescript-plugin.
 */
function initializeModule(options: _IInitializationOptions): server.PluginModule
{
    return initializer.Initialize(options);
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace initializeModule
{
    /**
     * Provides constants for the plugin.
     */
    export let Constants = _Constants;

    /**
     * Represents a message for a missing configuration.
     */
    export let ConfigNotFoundMessage = _ConfigNotFoundMessage;

    /**
     * Represents a message about a deprecated rule.
     */
    export let DeprecationMessage = _DeprecationMessage;

    /**
     * Represents a diagnostic.
     */
    export let Diagnostic = _Diagnostic;

    /**
     * Provides the functionality to decorate fix-ids.
     */
    export let DiagnosticIDDecorator = _DiagnosticIDDecorator;

    /**
     * Represents a diagnostic-message.
     */
    export let DiagnosticMessage = _DiagnosticMessage;

    /**
     * Represents a diagnostic which provides information about an `eslint` failure.
     */
    export let ESLintDiagnostic = _ESLintDiagnostic;

    /**
     * Represents a message for installing `eslint`.
     */
    export let ESLintNotInstalledMessage = _ESLintNotInstalledMessage;

    /**
     * Represents a diagnostic.
     */
    export type IDiagnostic = _IDiagnostic;

    /**
     * Represents a language service with the mock installed.
     */
    export type IMockedLanguageService = _IMockedLanguageService;

    /**
     * Represents a parsed diagnostic.
     */
    export type IParsedDiagnostic<T extends IDiagnostic> = _IParsedDiagnostic<T>;

    /**
     * Provides options for initialilzing this plugin.
     */
    export type IInitializationOptions = _IInitializationOptions;

    /**
     * Represents a log-level.
     */
    export let LogLevel = _LogLevel;

    /**
     * Provides the functionality to initialize new {@link PluginModule `PluginModule`}s.
     */
    export let ModuleInitializer = _ModuleInitializer;

    /**
     * Represents a service for handling `eslint`-warnings.
     */
    export let Plugin = _Plugin;

    /**
     * Represents the plugin-module.
     */
    export let PluginModule = _PluginModule;

    /**
     * Represents the plugin section in the `tsconfig.json` file.
     */
    export type ITSConfiguration = _ITSConfiguration;

    /**
     * Represents a package-manager.
     */
    export let PackageManager = _PackageManager;
}

/**
 * Initializes the module.
 *
 * @param options
 * The options for the plugin.
 *
 * @returns
 * The typescript-plugin.
 */
export = initializeModule;
