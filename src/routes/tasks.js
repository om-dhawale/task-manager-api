const express = require('express');
const router = express.Router();

const prisma = require('../prismaClient');
const asyncHandler = require('../middleware/asyncHandler');
const { createTaskSchema, updateTaskSchema } = require('../schemas/task.schema');
const ownership = require('../middleware/ownership');

router.post('/', asyncHandler(async (req, res) => {
  const result = createTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }
  const project = await prisma.project.findUnique({
    where: {
      id: result.data.projectId,
      userId: req.user.userId
    }
  })

  if(!project){
    return res.status(404).json({ error: 'Invalid project'})
  }
  const task = await prisma.task.create({ data: result.data });
  res.status(201).json(task);
}));

router.get('/', asyncHandler(async (req, res) => {

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  const where = {
    project: {
      userId: req.user.userId,
    }
  }

  if (req.query.completed !== undefined){
    where.completed = req.query.completed === 'true'
  }

  if(req.query.search){
    where.title = {
      contains: req.query.search,
      mode: 'insensitive'
    }
  }

  const [tasks, totalCount] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
    }),
    prisma.task.count({where})
  ]) 

  res.json({
    data: tasks,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount/limit)
    }
  })
}));

router.get('/:id', ownership, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
}));

router.put('/:id', ownership, asyncHandler(async (req, res) => {
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

router.delete('/:id', ownership, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.task.delete({ where: { id } });
  res.status(204).send();
}));

module.exports = router;