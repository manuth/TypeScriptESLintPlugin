import { TSServer } from "@manuth/typescript-languageservice-tester";
import { join } from "upath";

/**
 * Provides a custom implementation of the `TSServer` class.
 */
export class MyTSServer extends TSServer
{
    /**
     * @inheritdoc
     */
    public get LogFileName(): string
    {
        return join(__dirname, "..", "..", "..", "log", "test-server.log");
    }
}
