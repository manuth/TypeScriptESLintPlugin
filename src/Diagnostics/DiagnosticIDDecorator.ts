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
     * Initializes a new instance of the {@link FixIDDecorator `FixIDDecorator`} class.
     */
    public constructor()
    { }

    /**
     * Decorates a fix-id.
     *
     * @param fixId
     * The fix-id to decorate.
     *
     * @returns
     * The decorated {@link fixId `fixId`}.
     */
    public DecorateFix(fixId: string): string
    {
        return `${this.Decorator}${this.separator}${fixId}`;
    }

    /**
     * Decorates a combined fix-id.
     *
     * @param fixId
     * The fix-id to decorate.
     *
     * @returns
     * The decorated {@link fixId `fixId`}.
     */
    public DecorateCombinedFix(fixId: string): string
    {
        return this.DecorateFix(`${this.combinedFixDecorator}${this.separator}${fixId}`);
    }

    /**
     * Decorates a fix-id for disabling a check.
     *
     * @param fixId
     * The fix-id to decorate.
     *
     * @returns
     * The decorated fix.
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
     *
     * @returns
     * The fix-id with its decoration removed.
     */
    public UndecorateFix(fixId: string): string
    {
        return new RegExp(`^${this.Decorator}${this.separator}(?<ruleName>.*)`).exec(fixId).groups.ruleName;
    }

    /**
     * Removes the decoration from a combined fix-id.
     *
     * @param fixId
     * The fix-id to remove the decoration from.
     *
     * @returns
     * The fix-id with its decoration removed.
     */
    public UndecorateCombinedFix(fixId: string): string
    {
        return new RegExp(
            `^${this.combinedFixDecorator}${this.separator}(?<ruleName>.*)$`).exec(
                this.UndecorateFix(fixId)).groups?.ruleName;
    }

    /**
     * Removes the decoration from a fix-id for disabling a check.
     *
     * @param fixId
     * The fix-id to remove the decoration from.
     *
     * @returns
     * The fix-id with its decoration removed.
     */
    public UndecorateDisableFix(fixId: string): string
    {
        return new RegExp(
            `^${this.disableFixDecorator}${this.separator}(?<ruleName>.*)$`).exec(
                this.UndecorateFix(fixId)).groups?.ruleName;
    }
}
