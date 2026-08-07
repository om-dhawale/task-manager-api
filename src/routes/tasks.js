const express = require('express');
const router = express.Router();

const prisma = require('../prismaClient');
const asyncHandler = require('../middleware/asyncHandler');
const { createTaskSchema, updateTaskSchema } = require('../schemas/task.schema');

router.post('/', asyncHandler(async (req, res) => {
  const result = createTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }
  const task = await prisma.task.create({ data: result.data });
  res.status(201).json(task);
}));

router.get('/', asyncHandler(async (req, res) => {
  const tasks = await prisma.task.findMany();
  res.json(tasks);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const result = updateTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }
  const id = Number(req.params.id);
  const task = await prisma.task.update({
    where: { id },
    data: result.data,
  });
  res.json(task);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.task.delete({ where: { id } });
  res.status(204).send();
}));

module.exports = router;