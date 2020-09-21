import Assert = require("assert");
import { SpawnSyncReturns, spawnSync } from "child_process";
import npmWhich = require("npm-which");
import { TestConstants } from "./TestConstants";

suite(
    "Preparation",
    () =>
    {
        test(
            "Checking whether the test-project can be installed…",
            function()
            {
                let result: SpawnSyncReturns<Buffer>;
                this.timeout(0);

                Assert.doesNotThrow(
                    () =>
                    {
                        result = spawnSync(
                            npmWhich(TestConstants.ProjectDirectory).sync("npm"),
                            [
                                "install",
                                "--silent"
                            ],
                            {
                                cwd: TestConstants.ProjectDirectory
                            });
                    });

                Assert.strictEqual(result.status, 0);
            });
    });
