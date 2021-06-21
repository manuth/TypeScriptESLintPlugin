import type { DiagnosticCategory, DiagnosticMessageChain, DiagnosticRelatedInformation, SourceFile } from "typescript/lib/tsserverlibrary";
import { Range } from "vscode-languageserver";
import { IParsedDiagnostic } from "./IParsedDiagnostic";

/**
 * Represents a diagnostic.
 */
export interface IDiagnostic
{
    /**
     * The source of the diagnostic.
     */
    Source: string;

    /**
     * The code of the error.
     */
    Code: number;

    /**
     * The category of the diagnostic.
     */
    Category: DiagnosticCategory;

    /**
     * The source-file of the diagnostic.
     */
    File: SourceFile;

    /**
     * The range containing the error.
     */
    Range: Range;

    /**
     * The message of the diagnostic.
     */
    Message: string | DiagnosticMessageChain;

    /**
     * The information related to the diagnostic.
     */
    RelatedInformation?: DiagnosticRelatedInformation[];

    /**
     * The parsed representation of the diagnostic.
     */
    Parsed: IParsedDiagnostic<this>;
}
