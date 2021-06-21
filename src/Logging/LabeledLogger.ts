import { LoggerBase } from "./LoggerBase";
import { LogLevel } from "./LogLevel";

/**
 * Provides the functionality to log labeled messages.
 */
export class LabeledLogger
{
    /**
     * A component for writing log-messages.
     */
    private readonly logger: LoggerBase;

    /**
     * Initializes a new instance of the {@link LabeledLogger `LabeledLogger`} class.
     *
     * @param logger
     * The {@link logger `logger`} this logger is based on.
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
     * Logs a labeled message.
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
