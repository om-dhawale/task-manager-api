const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = require('../prismaClient');
const {registerUserSchema, loginUserSchema} = require('../schemas/auth.schema');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/signup',asyncHandler(async (req, res) => {
    const result = registerUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: result.data.email,
        hashedPassword: hashedPassword,
      },
    });

    res.status(201).json({id: user.id, email: user.email});
  })
);

router.post('/login', asyncHandler( async (req, res) => {

    const result = loginUserSchema.safeParse(req.body);
    if(!result.success){
        return res.status(400).json({error: result.error.flatten()});
    }

    const user = await prisma.user.findUnique({
        where: {email: result.data.email}
    });
    if(!user){
        return res.status(401).json({error: 'Invalid Credentials'})
    }

    const match = await bcrypt.compare(result.data.password, user.hashedPassword);
    if(!match){
        return res.status(401).json({error: 'Invalid Credentials'})
    }

    const token = jwt.sign(
      {userId: user.id},
      process.env.JWT_SECRET,
      { expiresIn: '1h'}
    )
    

    res.status(200).json({token})
}))

module.exports = router;    