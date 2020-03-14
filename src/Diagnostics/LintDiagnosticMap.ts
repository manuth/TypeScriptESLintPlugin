import { ILintDiagnostic } from "./ILintDiagnostic";

/**
 * Provides a set of lint-diagnostics.
 */
export class LintDiagnosticMap
{
    /**
     * The problems.
     */
    private map = new Map<string, ILintDiagnostic>();

    /**
     * Gets the problem with the specified start and end.
     *
     * @param start
     * The start-position of the problem.
     *
     * @param end
     * The end-position of the problem.
     */
    public Get(start: number, end: number): ILintDiagnostic
    {
        return this.map.get(this.Key(start, end));
    }

    /**
     * Adds a problem to the map with the specified `start` and `end`.
     *
     * @param start
     * The start-position of the problem.
     *
     * @param end
     * The end-position of the problem.
     *
     * @param item
     * The item to add.
     */
    public Set(start: number, end: number, item: ILintDiagnostic): void
    {
        this.map.set(this.Key(start, end), item);
    }

    /**
     * Gets the problems.
     */
    public Values(): IterableIterator<ILintDiagnostic>
    {
        return this.map.values();
    }

    /**
     * Determines a key for a problem.
     *
     * @param start
     * The start-position of the problem.
     *
     * @param end
     * The end-position of the problem.
     */
    private Key(start: number, end: number): string
    {
        return JSON.stringify([start, end]);
    }
}
