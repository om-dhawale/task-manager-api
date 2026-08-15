const express = require('express');
const router = express.Router();

const prisma = require('../prismaClient');
const asyncHandler = require('../middleware/asyncHandler');
const { createTaskSchema, updateTaskSchema } = require('../schemas/task.schema');
const ownership = require('../middleware/ownership');
const upload = require('../middleware/upload');
const fs = require('fs');

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

// file uploadds

router.post('/:id/attachments', upload.single('file'), asyncHandler( async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: parseInt(req.params.id)},
    include: { project: true}
  });
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (task.project.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Not your task' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const attachment = await prisma.attachment.create({
    data: {
      filename: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      taskId: task.id
    }
  })
  
  res.status(201).json(attachment);
}))

router.get(
  '/:id/attachments',
  asyncHandler(async (req, res) => {
    // check the task exists and belongs to this user (same pattern as before)
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.project.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not your task' });
    }

    const attachments = await prisma.attachment.findMany({
      where: { taskId: task.id },
    });

    res.json(attachments);
  })
);



router.delete(
  '/attachments/:id',
  asyncHandler(async (req, res) => {
    // find the attachment, and pull in the task+project to check ownership
    const attachment = await prisma.attachment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { task: { include: { project: true } } },
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    if (attachment.task.project.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not your attachment' });
    }

    // delete the DB row first
    await prisma.attachment.delete({ where: { id: attachment.id } });

    // then delete the actual file from disk
    fs.unlink(attachment.path, (err) => {
      if (err) console.error('Failed to delete file from disk:', err);
    });

    res.status(204).send();
  })
);


  module.exports = router;