import ts = require("typescript/lib/tsserverlibrary");
import { Diagnostic } from "./Diagnostic";

/**
 * Represents a diagnostic-message.
 */
export class DiagnosticMessage extends Diagnostic
{
    /**
     * The message of the diagnostic.
     */
    private message: string | ts.DiagnosticMessageChain;

    /**
     * Initializes a new instance of the `DiagnosticMessage` class
     *
     * @param typeScript
     * The typescript server.
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
    public constructor(typeScript: typeof ts, file: ts.SourceFile, message: string | ts.DiagnosticMessageChain, category?: ts.DiagnosticCategory)
    {
        super(typeScript, file, category);
        this.message = message;
    }

    /**
     * @inheritdoc
     */
    public get Message(): string | ts.DiagnosticMessageChain
    {
        return this.message;
    }
}
