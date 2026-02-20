import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for clean console output during development
const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    } ${stack ? `\n${stack}` : ''}`;
  })
);

// Formatter for production (JSON)
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Adjust based on environment
  format: process.env.NODE_ENV === 'production' ? prodFormat : consoleFormat,
  transports: [
    new winston.transports.Console()
  ],
});

export default logger;
