const { z } = require("zod");

const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
});

module.exports = { createProjectSchema, updateProjectSchema };