import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export interface WinstonConfigOptions {
  serviceName?: string;
  logLevel?: string;
  logDir?: string;
  enableFileLogging?: boolean;
  enableConsoleLogging?: boolean;
}

export interface WinstonConfig {
  level: string;
  format: winston.Logform.Format;
  defaultMeta: { service: string };
  transports: winston.transport[];
}

export const createWinstonConfig = (
  options: WinstonConfigOptions = {}
): WinstonConfig => {
  const {
    serviceName = "service",
    logLevel = process.env.LOG_LEVEL || "info",
    logDir = "logs",
    enableFileLogging = true,
    enableConsoleLogging = true,
  } = options;

  const transports: winston.transport[] = [];

  if (enableConsoleLogging) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      })
    );
  }

  if (enableFileLogging) {
    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/error-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        level: "error",
        maxSize: "20m",
        maxFiles: "14d",
        zippedArchive: true,
      })
    );

    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/combined-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        zippedArchive: true,
      })
    );

    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/${serviceName}-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        zippedArchive: true,
      })
    );
  }

  return {
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.prettyPrint()
    ),
    defaultMeta: { service: serviceName },
    transports,
  };
};

export const createWinstonLogger = (
  options: WinstonConfigOptions = {}
): winston.Logger => {
  const config = createWinstonConfig(options);
  return winston.createLogger(config);
};

export const defaultWinstonConfig: WinstonConfig = createWinstonConfig();
