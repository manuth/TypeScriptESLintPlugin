import DiagnosticsTests = require("./Diagnostics.test");
import ConfigTests = require("./Config.test");
import { LanguageServiceTester } from "./LanguageServiceTester";

suite(
    "Language-Service",
    () =>
    {
        /**
         * A component for testing the language-service.
         */
        let tester: LanguageServiceTester = new LanguageServiceTester();
        suiteTeardown(async () => tester.Dispose());
        DiagnosticsTests(tester);
        ConfigTests(tester);
    });
