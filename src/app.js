const express = require('express');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const authenticate = require('./middleware/authenticate');
const errorHandler = require('./middleware/errorHandler');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim())}}))
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/tasks', authenticate, taskRoutes);
app.use('/projects', authenticate,  projectRoutes);

app.use(errorHandler);

module.exports = app;