import { CLIEngine } from "eslint";
import { DiagnosticCategory, SourceFile } from "typescript/lib/tsserverlibrary";
import { Plugin } from "../Plugin";
import { Diagnostic } from "./Diagnostic";

/**
 * Represents a message about a deprecated rule.
 */
export class DeprecationMessage extends Diagnostic
{
    /**
     * The deprecated rule that has been used.
     */
    // eslint-disable-next-line deprecation/deprecation
    private deprecatedRuleUse: CLIEngine.DeprecatedRuleUse;

    /**
     * Initializes a new instance of the `DeprecationMessage` class.
     *
     * @param plugin
     * The plugin of the diagnostic.
     *
     * @param file
     * The file of the diagnostic.
     *
     * @param deprecatedRuleUse
     * The deprecated rule that has been used.
     *
     * @param category
     * The category of the diagnostic.
     */
    // eslint-disable-next-line deprecation/deprecation
    public constructor(plugin: Plugin, file: SourceFile, deprecatedRuleUse: CLIEngine.DeprecatedRuleUse, category?: DiagnosticCategory)
    {
        super(plugin, file, category);
        this.deprecatedRuleUse = deprecatedRuleUse;
    }

    /**
     * Gets the deprecated rule that has been used.
     */
    // eslint-disable-next-line deprecation/deprecation
    public get DeprecatedRuleUse(): CLIEngine.DeprecatedRuleUse
    {
        return this.deprecatedRuleUse;
    }

    /**
     * @inheritdoc
     */
    public get Message(): string
    {
        let result = `The rule \`${this.deprecatedRuleUse.ruleId}\` is deprecated.\nPlease use `;

        let replacements = this.deprecatedRuleUse.replacedBy.map(
            (replacement) => `\`${replacement}\``);

        if (replacements.length > 1)
        {
            result += "these alternatives:\n";
            result += replacements.slice(0, replacements.length - 1).join(", ");
            result += ` and ${replacements[replacements.length - 1]}`;
        }
        else
        {
            result += `${replacements[0]} instead.`;
        }

        return result;
    }
}
