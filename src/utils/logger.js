const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // log this level and anything more severe (error, warn, info)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = logger;