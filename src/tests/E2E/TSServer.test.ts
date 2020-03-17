import Assert = require("assert");
import ts = require("typescript/lib/tsserverlibrary");
import { join } from "upath";
import { TSServer } from "./TSServer";
import { TestConstants } from "./TestConstants";

suite(
    "TSServer",
    () =>
    {
        let tsServer: TSServer;

        setup(
            () =>
            {
                tsServer = new TSServer(TestConstants.ProjectDirectory);
            });

        teardown(
            async function()
            {
                this.enableTimeouts(false);
                await tsServer.Dispose();
            });

        suite(
            "Disposed",
            () =>
            {
                test(
                    "Checking whether the value is `false` while the server is running…",
                    () =>
                    {
                        Assert.ok(!tsServer.Disposed);
                    });
            });

        suite(
            "MakePath(string[] ...path)",
            () =>
            {
                test(
                    "Checking whether paths are joined correctly…",
                    () =>
                    {
                        let path = ["a", "b", "c"];
                        Assert.strictEqual(tsServer.MakePath(...path), join(tsServer.WorkingDirectory, ...path));
                    });
            });

        suite(
            "Send<T>(T request, boolean responseExpected)",
            () =>
            {
                let file: string;

                suiteSetup(
                    () =>
                    {
                        file = tsServer.MakePath("index.ts");
                    });

                test(
                    "Checking whether commands can be executed…",
                    async () =>
                    {
                        await Assert.doesNotReject(
                            async () =>
                            {
                                return tsServer.Send<ts.server.protocol.OpenRequest>(
                                    {
                                        type: "request",
                                        command: ts.server.protocol.CommandTypes.Open,
                                        arguments: {
                                            file: tsServer.MakePath("index.ts")
                                        }
                                    },
                                    false);
                            });
                    });

                test(
                    "Checking whether commands with with responses can be executed…",
                    async function()
                    {
                        this.enableTimeouts(false);
                        await Assert.doesNotReject(
                            async () =>
                            {
                                await tsServer.Send<ts.server.protocol.OpenRequest>(
                                    {
                                        type: "request",
                                        command: ts.server.protocol.CommandTypes.Open,
                                        arguments: {
                                            file
                                        }
                                    },
                                    false);

                                await tsServer.Send<ts.server.protocol.SemanticDiagnosticsSyncRequest>(
                                    {
                                        type: "request",
                                        command: ts.server.protocol.CommandTypes.SemanticDiagnosticsSync,
                                        arguments: {
                                            file,
                                            includeLinePosition: true
                                        }
                                    },
                                    true);
                            });
                    });

                test(
                    "Checking whether command-execution is blocked when the server is about to dispose…",
                    async () =>
                    {
                        tsServer.Send<ts.server.protocol.SemanticDiagnosticsSyncRequest>(
                            {
                                type: "request",
                                command: ts.server.protocol.CommandTypes.SemanticDiagnosticsSync,
                                arguments: {
                                    file,
                                    includeLinePosition: true
                                }
                            },
                            true);

                        tsServer.Dispose();
                        await Assert.rejects(
                            async () => tsServer.Send({ command: "test", type: "request" }, false),
                            /about to/);
                    });

                test(
                    "Checking whether command-execution is blocked when the server is disposed…",
                    async () =>
                    {
                        await tsServer.Dispose();
                        await Assert.rejects(
                            async () => tsServer.Send({ command: "test", type: "request" }, false));
                    });
            });

        suite(
            "WaitEvent(string eventName)",
            () =>
            {
                test(
                    "Checking whether events can be awaited…",
                    async () =>
                    {
                        await tsServer.WaitEvent("typingsInstallerPid");
                    });
            });

        suite(
            "Dispose()",
            () =>
            {
                test(
                    "Checking whether the server can be disposed…",
                    async () =>
                    {
                        await Assert.doesNotReject(() => tsServer.Dispose());
                    });

                test(
                    "Checking whether `Disposed` is true after the disposal…",
                    async () =>
                    {
                        await tsServer.Dispose();
                        Assert.ok(tsServer.Disposed);
                    });
            });
    });
