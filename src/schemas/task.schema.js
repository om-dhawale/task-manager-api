const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  projectId: z.number().int().positive(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").optional(),
  completed: z.boolean().optional(),
});

module.exports= { createTaskSchema, updateTaskSchema};