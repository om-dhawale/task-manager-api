const express = require('express');

const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use('/tasks', taskRoutes);
app.use('/projects', projectRoutes);

app.use(errorHandler);

module.exports = app;