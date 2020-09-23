import Assert = require("assert");
import { spawnSync } from "child_process";
import { Package } from "@manuth/package-json-editor";
import npmWhich = require("npm-which");
import { TestConstants } from "../TestConstants";
import { ConfigTests } from "./Config.test";
import { DiagnosticTests } from "./Diagnostics.test";
import { GeneralTests } from "./General.test";
import { LanguageServiceTester } from "./LanguageServiceTester";
import { MultiRootTests } from "./MultiRoot.test";

/**
 * Registers tests for the language-service.
 */
export function LanguageServiceTests(): void
{
    suite(
        "Language-Service",
        () =>
        {
            suiteSetup(
                function()
                {
                    this.timeout(0);
                    let tester = LanguageServiceTester.Default;

                    let result = spawnSync(
                        npmWhich(tester.MakePath()).sync("npm"),
                        [
                            "install",
                            "--silent",
                            "--no-package-lock"
                        ],
                        {
                            cwd: tester.MakePath()
                        });

                    Assert.strictEqual(result.status, 0);

                    let workspace = tester.CreateTemporaryWorkspace(
                        {
                            "no-debugger": "off",
                            "no-empty-character-class": "warn"
                        });

                    let alternativeWorkspace = tester.CreateTemporaryWorkspace(
                        {
                            "prefer-const": "warn"
                        });

                    let npmPackage = new Package();

                    let dependencies = [
                        "@typescript-eslint/eslint-plugin",
                        "@typescript-eslint/eslint-plugin-tslint",
                        "eslint-plugin-import",
                        "eslint-plugin-jsdoc",
                        "typescript"
                    ];

                    for (let dependency of dependencies)
                    {
                        npmPackage.DevelpomentDependencies.Add(
                            dependency,
                            TestConstants.Package.AllDependencies.Get(dependency));
                    }

                    npmPackage.Private = true;
                    npmPackage.DevelpomentDependencies.Add(
                        TestConstants.Package.Name, TestConstants.PackageDirectory);
                });

            GeneralTests();
            MultiRootTests();
            DiagnosticTests();
            ConfigTests();
        });
}
