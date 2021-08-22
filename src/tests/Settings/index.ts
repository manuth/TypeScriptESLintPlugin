import { basename } from "path";
import { ConfigurationTests } from "./Configuration.test";

/**
 * Registers tests for components related to settings.
 */
export function SettingTests(): void
{
    suite(
        basename(__dirname),
        () =>
        {
            ConfigurationTests();
        });
}
