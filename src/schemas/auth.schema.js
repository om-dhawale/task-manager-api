const { z } = require('zod');

const registerUserSchema = z.object({
    email: z.email(),
    password: z.string().min(8)
});

const loginUserSchema = z.object({
    email: z.email(),
    password: z.string()
});

module.exports = {registerUserSchema, loginUserSchema}