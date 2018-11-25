import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `log.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'log.log', level: 'info' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ],
  silent: process.env.NODE_ENV === 'test'
});
