import { LogLevel } from "./LogLevel";
import { LoggerBase } from "./LoggerBase";
import { SubLogger } from "./SubLogger";

/**
 * Represents a logger for logging information about the configuration class.
 */
export class ConfigurationLogger extends SubLogger
{
    /**
     * The log-level of the logger.
     */
    private logLevel: LogLevel;

    /**
     * Initializes a new instance of the `ConfigurationLogger` class.
     *
     * @param logLevel
     * The log-level of the logger.
     *
     * @param logger
     * The logger to use as base.
     *
     * @param category
     * The category of the logger.
     */
    public constructor(logLevel: LogLevel, logger: LoggerBase, category?: string)
    {
        super(ConfigurationLogger.GetParentLogger(logger), category);
        this.logLevel = logLevel;
    }

    /**
     * @inheritdoc
     */
    public get LogLevel(): LogLevel
    {
        return this.logLevel;
    }

    /**
     * Creates a parent logger for the `ConfigurationLogger`.
     *
     * @param logger
     * The logger to use as base.
     */
    private static GetParentLogger(logger: LoggerBase): LoggerBase
    {
        let categoryPath: string[] = [];

        while (logger instanceof SubLogger)
        {
            categoryPath.push(logger.Category);
            logger = logger.Parent;
        }

        for (let i = categoryPath.length - 1; i >= 0; i--)
        {
            logger = new SubLogger(logger, categoryPath[i]);
        }

        return logger;
    }
}
