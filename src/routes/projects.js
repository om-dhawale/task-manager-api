const express = require('express');
const router = express.Router();

const prisma = require('../prismaClient');
const asyncHandler = require('../middleware/asyncHandler');
const { createProjectSchema } = require("../schemas/project.schema");

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
    },
  });
  res.status(201).json(project);
}));

// READ ALL
router.get("/", asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany();
  res.json(projects);
}));


module.exports = router;