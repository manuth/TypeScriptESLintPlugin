import { DiagnosticCategory, SourceFile } from "typescript/lib/tsserverlibrary";
import { Plugin } from "../Plugin";
import { Diagnostic } from "./Diagnostic";

/**
 * Represents a message for a missing configuration.
 */
export class ConfigNotFoundMessage extends Diagnostic
{
    /**
     * The actual exception.
     */
    private exception: Error;

    /**
     * Initializes a new instance of the {@link ConfigNotFoundMessage `ConfigNotFoundMessage`} class.
     *
     * @param plugin
     * The plugin of the diagnostic.
     *
     * @param file
     * The file of the diagnostic.
     *
     * @param exception
     * The actual exception.
     *
     * @param category
     * The category of the message.
     */
    public constructor(plugin: Plugin, file: SourceFile, exception: Error, category?: DiagnosticCategory)
    {
        super(plugin, file, category);
        this.exception = exception;
    }

    /**
     * @inheritdoc
     */
    public get Message(): string
    {
        return this.exception.message;
    }
}
