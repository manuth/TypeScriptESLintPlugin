import { TSServer } from "@manuth/typescript-languageservice-tester";
import { join } from "upath";
import { Constants } from "../../Constants";

/**
 * Provides a custom implementation of the {@link TSServer `TSServer`} class.
 */
export class MyTSServer extends TSServer
{
    /**
     * @inheritdoc
     */
    public override get LogFileName(): string
    {
        return join(Constants.PackageDirectory, "log", "test-server.log");
    }
}
