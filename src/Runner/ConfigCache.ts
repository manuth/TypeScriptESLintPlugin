import { Linter } from "eslint";

/**
 * Provides the functionality to cache configurations.
 */
export class ConfigCache
{
    /**
     * Gets or sets the configuration.
     */
    public Configuration: Linter.Config;

    /**
     * The path to the file this config belongs to.
     */
    private filePath: string;

    /**
     * Initializes a new instance of the `ConfigCache` class.
     */
    public constructor()
    { }

    /**
     * Overwrites the cached configuration.
     *
     * @param filePath
     * The path to the file this config belongs to.
     *
     * @param configuration
     * The configuration.
     */
    public Set(filePath: string, configuration: Linter.Config)
    {
        this.filePath = filePath;
        this.Configuration = configuration;
    }

    /**
     * Retrieves the cached configuration for the specified path.
     *
     * @param forPath
     * The path to the file to retrieve the configuration for.
     */
    public Get(forPath: string)
    {
        return forPath === this.filePath ? this.Configuration : undefined;
    }

    /**
     * Flushes the config-cache.
     */
    public Flush()
    {
        this.filePath = undefined;
        this.Configuration = undefined;
    }
}