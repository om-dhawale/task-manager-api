const asyncHandler = require('./asyncHandler');
const prisma = require('../prismaClient');

const projectOwnership = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);

  const project = await prisma.project.findUnique({
    where: { id }
  });

  if (!project) {
    return res.status(404).json({ error: 'Project Not Found' });
  }

  if (project.userId !== req.user.userId) {
    return res.status(403).json({ error: 'You do not have access to this project' });
  }

  next();
});

module.exports = projectOwnership;