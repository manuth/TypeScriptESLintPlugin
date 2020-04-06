import { TempDirectory } from "temp-filesystem";
import { LanguageServiceTester } from "./LanguageServiceTester";
import { TestWorkspace } from "./TestWorkspace";

/**
 * Represents a temporary workspace.
 */
export class TempWorkspace extends TestWorkspace
{
    /**
     * The directory of the workspace.
     */
    private readonly tempDirectory: TempDirectory;

    /**
     * Initializes a new instance of the `TestWorkspace` class.
     *
     * @param tester
     * The language-service tester for testing the workspace.
     *
     * @param tempDirectory
     * The directory of the workspace.
     */
    public constructor(tester: LanguageServiceTester, tempDirectory: TempDirectory)
    {
        super(tester, tempDirectory.FullName);
        this.tempDirectory = tempDirectory;
    }

    /**
     * Gets the directory of the workspace.
     */
    public get TempDirectory(): TempDirectory
    {
        return this.tempDirectory;
    }

    /**
     * @inheritdoc
     */
    public async Dispose(): Promise<void>
    {
        await super.Dispose();
        this.TempDirectory.Dispose();
    }
}
