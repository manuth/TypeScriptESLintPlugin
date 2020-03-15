import { Constants } from "../Constants";

/**
 * Provides the functionality to decorate fix-ids.
 */
export class DiagnosticIDDecorator
{
    /**
     * A character for separating decorators.
     */
    private separator = ":";

    /**
     * A set of characters for indicating a combined fix.
     */
    private combinedFixDecorator = "all";

    /**
     * A set of characters for indicating a disable fix.
     */
    private disableFixDecorator = "disable";

    /**
     * Gets the decorator.
     */
    public get Decorator(): string
    {
        return Constants.FixIdDecorator;
    }

    /**
     * Initializes a new instance of the `FixIDDecorator` class.
     */
    public constructor()
    { }

    /**
     * Decorates a fix-id.
     *
     * @param fixId
     * The fix-id to decorate.
     */
    public DecorateFix(fixId: string): string
    {
        return `${this.Decorator}${this.separator}${fixId}`;
    }

    /**
     * Decorates a fix-id.
     *
     * @param fixId
     * The fix-id to decorate.
     */
    public DecorateCombinedFix(fixId: string): string
    {
        return this.DecorateFix(`${this.combinedFixDecorator}${this.separator}${fixId}`);
    }

    /**
     * Decorates a fix-id.
     *
     * @param fixId
     * The fix-id to decorate.
     */
    public DecorateDisableFix(fixId: string): string
    {
        return this.DecorateFix(`${this.disableFixDecorator}${this.separator}${fixId}`);
    }

    /**
     * Removes the decoration from a fix-id.
     *
     * @param fixId
     * The fix-id to remove the decoration from.
     */
    public UndecorateFix(fixId: string): string
    {
        return new RegExp(`^${this.Decorator}${this.separator}(?<ruleName>.*)`).exec(fixId).groups.ruleName;
    }

    /**
     * Removes the decoration from a fix-id.
     *
     * @param fixId
     * The fix-id to remove the decoration from.
     */
    public UndecorateCombinedFix(fixId: string): string
    {
        return new RegExp(
            `^${this.combinedFixDecorator}${this.separator}(?<ruleName>.*)$`).exec(
                this.UndecorateFix(fixId)).groups?.ruleName;
    }

    /**
     * Removes the decoration from a fix-id.
     *
     * @param fixId
     * The fix-id to remove the decoration from.
     */
    public UndecorateDisableFix(fixId: string): string
    {
        return new RegExp(
            `^${this.disableFixDecorator}${this.separator}(?<ruleName>.*)$`).exec(
                this.UndecorateFix(fixId)).groups?.ruleName;
    }
}
