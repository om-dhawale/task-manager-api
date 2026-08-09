const express = require('express');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const authenticate = require('./middleware/authenticate');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/tasks', authenticate, taskRoutes);
app.use('/projects', authenticate,  projectRoutes);

app.use(errorHandler);

module.exports = app;