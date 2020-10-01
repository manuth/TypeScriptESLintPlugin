import { LoggerBase } from "./LoggerBase";
import { LogLevel } from "./LogLevel";

/**
 * Provides the functionality to log messages for the runner.
 */
export class RunnerLogger
{
    /**
     * A component for writing log-messages.
     */
    private readonly logger: LoggerBase;

    /**
     * Initializes a new instance of the `RunnerLogger` class.
     *
     * @param logger
     * The logger this logger is based on.
     */
    public constructor(logger: LoggerBase)
    {
        this.logger = logger;
    }

    /**
     * Gets a component for writing log-messages.
     */
    protected get Logger(): LoggerBase
    {
        return this.logger;
    }

    /**
     * Logs a message.
     *
     * @param label
     * The label of the message.
     *
     * @param message
     * The message to log.
     *
     * @param logLevel
     * The level of the log-message.
     */
    public Log(label: string, message: string, logLevel?: LogLevel): void
    {
        this.Logger.CreateSubLogger(label).Log(message, logLevel);
    }
}
