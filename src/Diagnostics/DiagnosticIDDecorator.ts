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
     * Gets a character for separating decorators.
     */
    public get Separator(): string
    {
        return this.separator;
    }

    /**
     * Gets a set of characters for indicating a combined fix.
     */
    public get CombinedFixDecorator(): string
    {
        return this.combinedFixDecorator;
    }

    /**
     * Gets a set of characters for indicating a disable fix.
     */
    public get DisableFixDecorator(): string
    {
        return this.disableFixDecorator;
    }

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
        return this.AddPrefix(fixId, this.Decorator);
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
        return this.DecorateFix(this.AddPrefix(fixId, this.CombinedFixDecorator));
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
        return this.DecorateFix(this.AddPrefix(fixId, this.DisableFixDecorator));
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
        return this.StripPrefix(fixId, this.Decorator);
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
        return this.StripPrefix(this.UndecorateFix(fixId), this.CombinedFixDecorator);
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
        return this.StripPrefix(this.UndecorateFix(fixId), this.DisableFixDecorator);
    }

    /**
     * Adds the specified {@link prefix `prefix`} to the specified {@link subject `subject`}.
     *
     * @param subject
     * The fix-id to add the specified {@link prefix `prefix`} to.
     *
     * @param prefix
     * The prefix to add to the specified {@link subject `subject`}.
     *
     * @returns
     * The specified {@link subject `subject`} prefixed with the specified {@link prefix `prefix`}.
     */
    protected AddPrefix(subject: string, prefix: string): string
    {
        return `${prefix}${this.separator}${subject}`;
    }

    /**
     * Strips the specified {@link prefix `prefix`} from the specified {@link subject `subject`}.
     *
     * @param subject
     * The fix-id to strip the specified {@link prefix `prefix`} from.
     *
     * @param prefix
     * The prefix to strip from the specified {@link subject `subject`}.
     *
     * @returns
     * The {@link subject `subject`} with its {@link prefix `prefix`} stripped away.
     */
    protected StripPrefix(subject: string, prefix: string): string
    {
        let ruleNameKey = "ruleName";

        return new RegExp(
            `^${prefix}${this.separator}(?<${ruleNameKey}>.*$)`).exec(
                subject).groups[ruleNameKey];
    }
}
