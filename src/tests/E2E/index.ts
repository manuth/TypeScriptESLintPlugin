import Assert = require("assert");
import { spawnSync, SpawnSyncReturns } from "child_process";
import npmWhich = require("npm-which");
import { Constants } from "./Constants";

suite(
    "End-to-End Tests",
    () =>
    {
        suite(
            "Preparation",
            () =>
            {
                test(
                    "Checking whether the test-project can be installed…",
                    function()
                    {
                        let result: SpawnSyncReturns<Buffer>;
                        this.timeout(15.5 * 1000);
                        this.slow(7.75 * 1000);
                        this.enableTimeouts(false);

                        Assert.doesNotThrow(
                            () =>
                            {
                                result = spawnSync(
                                    npmWhich(Constants.ProjectDirectory).sync("npm"),
                                    [
                                        "install",
                                        "--silent"
                                    ],
                                    {
                                        cwd: Constants.ProjectDirectory
                                    });
                            });

                        Assert.strictEqual(result.status, 0);
                    });
            });

        require("./TSServer.test");
    });
