require('dotenv').config();
const    config= require('./src/config/env');
const logger = require('./src/utils/logger');

const app = require('./src/app');

const PORT = 3000;

app.listen(PORT, () =>
  logger.info(`Server running on port ${PORT}`)
);
