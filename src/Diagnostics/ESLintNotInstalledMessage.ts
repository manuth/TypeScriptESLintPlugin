import { DiagnosticCategory, SourceFile } from "typescript/lib/tsserverlibrary";
import { Plugin } from "../Plugin";
import { PackageManager } from "../Settings/PackageManager";
import { Diagnostic } from "./Diagnostic";

/**
 * Represents a message for installing `eslint`.
 */
export class ESLintNotInstalledMessage extends Diagnostic
{
    /**
     * The name of the package to install.
     */
    private static packageName = "eslint";

    /**
     * The commands for installing the linter locally.
     */
    private static localCommands: Record<PackageManager, string> = null;

    /**
     * The commands for installing the linter globally.
     */
    private static globalCommands: Record<PackageManager, string> = null;

    /**
     * Initializes a new instance of the {@link ESLintNotInstalledMessage `ESLintNotInstalledMessage`} class.
     *
     * @param plugin
     * The plugin of the diagnostic.
     *
     * @param file
     * The file of the diagnostic.
     *
     * @param category
     * The category of the message.
     */
    public constructor(plugin: Plugin, file: SourceFile, category?: DiagnosticCategory)
    {
        super(plugin, file, category);
    }

    /**
     * Gets the name of the package to install.
     */
    protected static get PackageName(): string
    {
        return this.packageName;
    }

    /**
     * Gets the commands for installing the linter locally.
     */
    protected static get LocalCommands(): Record<PackageManager, string>
    {
        if (this.localCommands === null)
        {
            this.localCommands = {
                [PackageManager.NPM]: `npm install ${this.PackageName}`,
                [PackageManager.PNPM]: `pnpm install ${this.PackageName}`,
                [PackageManager.Yarn]: `yarn add ${this.PackageName}`
            };
        }

        return this.localCommands;
    }

    /**
     * Gets the commands for installing the linter globally.
     */
    protected static get GlobalCommands(): Record<PackageManager, string>
    {
        if (this.globalCommands === null)
        {
            this.globalCommands = {
                [PackageManager.NPM]: `npm install -g ${this.PackageName}`,
                [PackageManager.PNPM]: `pnpm install -g ${this.PackageName}`,
                [PackageManager.Yarn]: `yarn global add ${this.PackageName}`
            };
        }

        return this.globalCommands;
    }

    /**
     * @inheritdoc
     */
    public get Message(): string
    {
        return [
            `Failed to load the ESLint library for '${this.File.fileName}'`,
            "To use ESLint please install the eslint-module " +
            `using '${ESLintNotInstalledMessage.LocalCommands[this.Config.PackageManager]}' or` +
            `using '${ESLintNotInstalledMessage.GlobalCommands[this.Config.PackageManager]}' to install it globally.`,
            "Be sure to restart your editor after the installation."
        ].join("\n");
    }
}
