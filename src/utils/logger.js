const winston = require('winston');

const isDev = process.env.NODE_ENV === 'development';

const logger = winston.createLogger({
  level: 'info', // log this level and anything more severe (error, warn, info)
  format: isDev
    ? winston.format.combine(
        winston.format.colorize(),
        winston.format.simple() // e.g. "info: Server running on port 3000"
      )
    : winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // unchanged from before — same JSON as Feature 12
      ),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = logger;