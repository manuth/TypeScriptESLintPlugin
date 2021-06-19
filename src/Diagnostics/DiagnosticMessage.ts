import { DiagnosticCategory, DiagnosticMessageChain, SourceFile } from "typescript/lib/tsserverlibrary";
import { Plugin } from "../Plugin";
import { Diagnostic } from "./Diagnostic";

/**
 * Represents a diagnostic-message.
 */
export class DiagnosticMessage extends Diagnostic
{
    /**
     * The message of the diagnostic.
     */
    private message: string | DiagnosticMessageChain;

    /**
     * Initializes a new instance of the {@link DiagnosticMessage `DiagnosticMessage`} class
     *
     * @param plugin
     * The plugin o the diagnostic.
     *
     * @param file
     * The file of the diagnostic.
     *
     * @param message
     * The message of the diagnostic.
     *
     * @param category
     * The category of the diagnostic.
     */
    public constructor(plugin: Plugin, file: SourceFile, message: string | DiagnosticMessageChain, category?: DiagnosticCategory)
    {
        super(plugin, file, category);
        this.message = message;
    }

    /**
     * @inheritdoc
     */
    public get Message(): string | DiagnosticMessageChain
    {
        return this.message;
    }
}
