import { Logger } from "../Logging/Logger";
import { Configuration } from "./Configuration";
import { ITSConfiguration } from "./ITSConfiguration";

/**
 * Proides the functionality to manage and automatically reload configurations.
 */
export class ConfigurationManager
{
    /**
     * The configuration.
     */
    private config: Configuration;

    /**
     * The event-handlers for the `ConfigUpdated`-event.
     */
    private readonly configUpdated = new Set<() => void>();

    /**
     * A component for writing log-messages.
     */
    private logger: Logger;

    /**
     * Initializes a new instance of the `ConfigurationManager` class.
     *
     * @param logger
     * A component for writing log-messages.
     */
    public constructor(logger: Logger)
    {
        this.logger = logger;
    }

    /**
     * Gets or sets the configuration.
     */
    public get Config(): Configuration
    {
        return this.config;
    }

    /**
     * Occurs when the config is updated.
     */
    public get ConfigUpdated(): Pick<Set<() => void>, "add" | "delete">
    {
        return {
            add: (eventHandler): Set<() => void> => this.configUpdated.add(eventHandler),
            delete: (eventHandler): boolean => this.configUpdated.delete(eventHandler)
        };
    }

    /**
     * Updates the configuration.
     *
     * @param config
     * The config to load.
     */
    public Update(config: ITSConfiguration): void
    {
        this.config = new Configuration(config);
        this.OnConfigUpdated();
    }

    /**
     * Executes the `ConfigUpdated` event-handlers.
     */
    protected OnConfigUpdated(): void
    {
        this.logger.Log("Updating the configuration…");

        for (let eventHandler of this.configUpdated)
        {
            eventHandler();
        }
    }
}
