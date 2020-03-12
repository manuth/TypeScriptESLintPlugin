import { ChildProcess, fork } from "child_process";
import Path = require("upath");
import readline = require("readline");
import ts = require("typescript/lib/tsserverlibrary");
import { EventEmitter } from "events";

/**
 * Provides an implementation of the ts-server for testing.
 */
export class TSServer
{
    /**
     * Gets or sets the path to the working directory.
     */
    public WorkingDirectory: string;

    /**
     * The path to the log-file.
     */
    private logFileName = Path.join(__dirname, "..", "..", "..", "test-server.log");

    /**
     * The server-process.
     */
    private serverProcess: ChildProcess;

    /**
     * The current sequence-number.
     */
    private sequenceNumber = 0;

    /**
     * The methods for resolving the requests.
     */
    private requestResolverCollection = new Map<number, (response: ts.server.protocol.Response) => void>();

    /**
     * A component for emitting events.
     */
    private eventEmitter = new EventEmitter();

    /**
     * A value indicating whether a disposal is requested.
     */
    private disposalRequested = false;

    /**
     * A value indicating whether the server is disposed.
     */
    private disposed = false;

    /**
     * A promise that resolves as soon as the server exits.
     */
    private exitPromise: Promise<number>;

    /**
     * Initializes a new instance of the `TSServer` class.
     *
     * @param workingDirectory
     * The directory to open.
     */
    public constructor(workingDirectory: string)
    {
        this.WorkingDirectory = workingDirectory;

        this.serverProcess = fork(
            this.MakePath("node_modules", "typescript", "lib", "tsserver"),
            [
                "--logVerbosity",
                "verbose",
                "--logFile",
                this.LogFileName
            ],
            {
                cwd: this.WorkingDirectory,
                stdio: ["pipe", "pipe", "pipe", "ipc"],
                execArgv: []
            });

        this.exitPromise = new Promise(
            (resolve, reject) =>
            {
                this.serverProcess.on("exit", (code) => resolve(code));
                this.serverProcess.on("error", (error) => reject(error));
            });

        this.serverProcess.stdout.setEncoding("utf-8");

        readline.createInterface(
            {
                input: this.serverProcess.stdout,
                output: this.serverProcess.stdin
            }).on(
                "line",
                (input) =>
                {
                    if (!input.startsWith("{"))
                    {
                        return;
                    }
                    else
                    {
                        try
                        {
                            let result = JSON.parse(input) as ts.server.protocol.Message;

                            switch (result.type)
                            {
                                case "response":
                                    let response = result as ts.server.protocol.Response;

                                    if (this.requestResolverCollection.has(response.request_seq))
                                    {
                                        let resolver = this.requestResolverCollection.get(response.request_seq);
                                        this.requestResolverCollection.delete(response.request_seq);
                                        resolver(response);

                                        if (this.disposalRequested && (this.requestResolverCollection.size === 0))
                                        {
                                            this.Dispose();
                                        }
                                    }
                                    break;
                                case "event":
                                    let event = result as ts.server.protocol.Event;
                                    this.eventEmitter.emit(event.event, event);
                                    break;
                            }
                        }
                        catch
                        { }
                    }
                });
    }

    /**
     * Gets the name of the log-file.
     */
    public get LogFileName(): string
    {
        return this.logFileName;
    }

    /**
     * Gets a value indicating whether the server is disposed.
     */
    public get Disposed(): boolean
    {
        return this.disposed;
    }

    /**
     * Creates a path relative to the working-directory.
     *
     * @param path
     * The path to join.
     */
    public MakePath(...path: string[]): string
    {
        return Path.join(this.WorkingDirectory, ...path);
    }

    /**
     * Sends a request to the server.
     *
     * @param request
     * The request to send.
     *
     * @param responseExpected
     * A value indicating whether an answer is expected.
     */
    public async Send<T extends ts.server.protocol.Request>(request: Omit<T, "seq"> & Partial<T>, responseExpected: boolean): Promise<ts.server.protocol.Response>
    {
        request.seq = request.seq ?? this.sequenceNumber++;

        if (this.Disposed)
        {
            throw new Error("The server is disposed!");
        }
        else if (this.disposalRequested)
        {
            throw new Error("The server is about to be disposed!");
        }
        else
        {
            let result = new Promise<ts.server.protocol.Response>(
                (resolve) =>
                {
                    if (responseExpected)
                    {
                        this.requestResolverCollection.set(
                            request.seq,
                            (response) =>
                            {
                                resolve(response);
                            });
                    }
                    else
                    {
                        resolve(null);
                    }
                });

            this.serverProcess.stdin.write(`${JSON.stringify(request)}\n`);
            return result;
        }
    }

    /**
     * Waits for the specified event.
     *
     * @param eventName
     * The event to wait for.
     */
    public WaitEvent(eventName: string): Promise<ts.server.protocol.Event>
    {
        return new Promise<ts.server.protocol.Event>(
            (resolve) =>
            {
                this.eventEmitter.once(eventName, () => resolve());
            });
    }

    /**
     * Disposes the server.
     */
    public async Dispose(): Promise<number>
    {
        this.disposalRequested = true;

        if (this.requestResolverCollection.size === 0)
        {
            this.serverProcess.stdin.end();
            this.disposed = true;
            this.disposalRequested = false;
        }

        return this.exitPromise;
    }
}
