import DiagnosticsTests = require("./Diagnostics.test");
import ConfigTests = require("./Config.test");
import { LanguageServiceTester } from "./LanguageServiceTester";
import MultiRootTests = require("./MultiRoot.test");

suite(
    "Language-Service",
    () =>
    {
        /**
         * A component for testing the language-service.
         */
        let tester: LanguageServiceTester = new LanguageServiceTester();
        suiteTeardown(async () => tester.Dispose());
        require("./General.test");
        DiagnosticsTests(tester);
        ConfigTests(tester);
        MultiRootTests(tester);
    });
