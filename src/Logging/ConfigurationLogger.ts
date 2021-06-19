import { LoggerBase, SubLogger } from "./LoggerBase";
import { LogLevel } from "./LogLevel";

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
     * Initializes a new instance of the {@link ConfigurationLogger `ConfigurationLogger`} class.
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
    public override get LogLevel(): LogLevel
    {
        return this.logLevel;
    }

    /**
     * Creates a parent logger for the {@link ConfigurationLogger `ConfigurationLogger`}.
     *
     * @param logger
     * The logger to use as base.
     *
     * @returns
     * The parent loger for the {@link ConfigurationLogger `ConfigurationLogger`}.
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
