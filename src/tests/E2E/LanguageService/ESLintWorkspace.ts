import { pathToFileURL } from "url";
import { Package } from "@manuth/package-json-editor";
import { TestWorkspace } from "@manuth/typescript-languageservice-tester";
import { writeJSON } from "fs-extra";
import { join, relative } from "upath";
import { Constants } from "../../../Constants";
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
     * Initializes a new instance of the `ESLintWorkspace` class.
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
    public get Tester(): ESLintLanguageServiceTester
    {
        return super.Tester as ESLintLanguageServiceTester;
    }

    /**
     * @inheritdoc
     */
    protected get InstallerPackage(): Package
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
            result.DevelpomentDependencies.Add(
                dependency,
                Constants.Package.AllDependencies.Get(dependency));
        }

        result.Private = true;
        result.DevelpomentDependencies.Add(Constants.Package.Name, `${pathToFileURL(Constants.PackageDirectory)}`);
        return result;
    }

    /**
     * Initializes the language-service tester.
     */
    public async Install(): Promise<void>
    {
        await super.Install();
        await this.Configure();
    }

    /**
     * Writes the configuration of the workspace.
     *
     * @param eslintRules
     * The eslint-rules to apply.
     *
     * @param pluginConfiguration
     * The plugin-configuration to apply.
     */
    public async Configure(eslintRules?: Record<string, unknown>, pluginConfiguration?: ITSConfiguration): Promise<void>
    {
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

        await writeJSON(
            this.MakePath("tsconfig.json"),
            {
                extends: relative(this.MakePath(), join(TestConstants.TestDirectory, "tsconfig.base.json")),
                compilerOptions: {
                    plugins: [
                        {
                            name: Constants.Package.Name,
                            logLevel: "verbose",
                            ...pluginConfiguration
                        }
                    ]
                }
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
    public async AnalyzeCode(code: string, scriptKind?: ts.server.protocol.ScriptKindName, fileName?: string): Promise<ESLintDiagnosticResponse>
    {
        let result = await super.AnalyzeCode(code, scriptKind, fileName);

        return new ESLintDiagnosticResponse(
            result.DiagnosticsResponse,
            this,
            result.ScriptKind,
            result.FileName);
    }
}
