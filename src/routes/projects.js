const express = require('express');
const router = express.Router();

const prisma = require('../prismaClient');
const asyncHandler = require('../middleware/asyncHandler');
const { createProjectSchema } = require("../schemas/project.schema");
const projectOwnership = require('../middleware/projectOwnership')

//CREATE
router.post("/", asyncHandler(async (req, res) => {
  const result = createProjectSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }
  const { name } = result.data;
  const project = await prisma.project.create({
    data: {
      name,
      userId: req.user.userId   
    },
  });
  res.status(201).json(project);
}));

// READ ALL
router.get("/", asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany({
    where: {userId: req.user.userId}
  });
  res.json(projects);
}));

router.get('/:id', projectOwnership, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const project = await prisma.project.findUnique({ where: { id } });
  res.json(project);
}));

router.put('/:id', projectOwnership, asyncHandler(async (req, res) => {
  const result = updateProjectSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }
  const id = Number(req.params.id);
  const project = await prisma.project.update({
    where: { id },
    data: result.data,
  });
  res.json(project);
}));

router.delete('/:id', projectOwnership, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.project.delete({ where: { id } });
  res.status(204).send();
}));


module.exports = router;