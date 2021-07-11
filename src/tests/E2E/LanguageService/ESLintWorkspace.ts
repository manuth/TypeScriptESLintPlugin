import { pathToFileURL } from "url";
import { Package } from "@manuth/package-json-editor";
import { TestWorkspace } from "@manuth/typescript-languageservice-tester";
import { writeJSON } from "fs-extra";
import merge = require("lodash.merge");
import { TSConfigJSON } from "types-tsconfig";
import { join, relative } from "upath";
import { Constants } from "../../../Constants";
import { LogLevel } from "../../../Logging/LogLevel";
import { ITSConfiguration } from "../../../Settings/ITSConfiguration";
import { TestConstants } from "../TestConstants";
import { ESLintDiagnosticResponse } from "./ESLintDiagnosticResponse";
import { ESLintLanguageServiceTester } from "./ESLintLanguageServiceTester";

/**
 * Represents a workspace for testing purposes.
 */
export class ESLintWorkspace extends TestWorkspace
{
    /**
     * Initializes a new instance of the {@link ESLintWorkspace `ESLintWorkspace`} class.
     *
     * @param tester
     * The language-service tester for testing the workspace.
     *
     * @param workspacePath
     * The path to the directory of the workspace.
     */
    public constructor(tester: ESLintLanguageServiceTester, workspacePath: string)
    {
        super(tester, workspacePath);
    }

    /**
     * Gets the language-service tester for testing the workspace.
     */
    public override get Tester(): ESLintLanguageServiceTester
    {
        return super.Tester as ESLintLanguageServiceTester;
    }

    /**
     * @inheritdoc
     */
    protected override get InstallerPackage(): Package
    {
        let result = super.InstallerPackage;

        let dependencies = [
            "@manuth/eslint-plugin-typescript",
            "@typescript-eslint/eslint-plugin",
            "@typescript-eslint/eslint-plugin-tslint",
            "eslint",
            "eslint-plugin-deprecation",
            "eslint-plugin-import",
            "eslint-plugin-jsdoc",
            "tslint"
        ];

        for (let dependency of dependencies)
        {
            if (!result.AllDependencies.Has(dependency))
            {
                result.DevelopmentDependencies.Add(
                    dependency,
                    Constants.Package.AllDependencies.Get(dependency));
            }
        }

        result.Private = true;
        result.DevelopmentDependencies.Add(Constants.Package.Name, `${pathToFileURL(Constants.PackageDirectory)}`);
        return result;
    }

    /**
     * Initializes the language-service tester.
     */
    public override async Install(): Promise<void>
    {
        await super.Install();
        await this.Configure();
    }

    /**
     * Writes the configuration of the workspace.
     *
     * @param tsConfig
     * The TypeScript-settings to apply.
     *
     * @param eslintRules
     * The eslint-rules to apply.
     *
     * @param pluginConfiguration
     * The plugin-configuration to apply.
     */
    public override async Configure(tsConfig?: TSConfigJSON, eslintRules?: Record<string, unknown>, pluginConfiguration?: ITSConfiguration): Promise<void>
    {
        await super.Configure(merge<TSConfigJSON, TSConfigJSON>(
            {
                extends: relative(this.MakePath(), join(TestConstants.TestDirectory, "tsconfig.base.json")),
                compilerOptions: {
                    plugins: [
                        {
                            name: Constants.Package.Name,
                            logLevel: LogLevel.Verbose,
                            ...pluginConfiguration
                        }
                    ]
                }
            },
            tsConfig));

        await writeJSON(
            this.MakePath(".eslintrc"),
            {
                extends: relative(this.MakePath(), join(TestConstants.TestDirectory, ".eslintrc.base.js")),
                ...(
                    eslintRules ?
                        {
                            rules: eslintRules
                        } :
                        {})
            });
    }

    /**
     * @inheritdoc
     *
     * @param code
     * The code to check.
     *
     * @param scriptKind
     * The name of the script-kind to open.
     *
     * @param fileName
     * The name of the file to check.
     *
     * @returns
     * The response of the code-analysis.
     */
    public override async AnalyzeCode(code: string, scriptKind?: ts.server.protocol.ScriptKindName, fileName?: string): Promise<ESLintDiagnosticResponse>
    {
        let result = await super.AnalyzeCode(code, scriptKind, fileName);

        return new ESLintDiagnosticResponse(
            result.CodeAnalysisResult,
            this,
            result.ScriptKind,
            result.FileName);
    }
}
