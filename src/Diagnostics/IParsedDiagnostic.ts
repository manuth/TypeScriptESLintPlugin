import type { Diagnostic } from "typescript/lib/tsserverlibrary";
import { IDiagnostic } from "./IDiagnostic";

/**
 * Represents a parsed diagnostic.
 */
export interface IParsedDiagnostic<T extends IDiagnostic> extends Diagnostic
{
    /**
     * The origin of the diagnostic.
     */
    origin: T;
}
