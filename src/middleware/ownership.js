const asyncHandler = require('./asyncHandler');
const prisma = require('../prismaClient');

const ownership = asyncHandler( async (req, res, next) => {
    const id = Number(req.params.id);

    const task = await prisma.task.findUnique({
        where: {id},
        include: {project: true}
    });

    if(!task){
        return res.status(404).json({error: `Task Not Found`})
    }

    if(task.project.userId !== req.user.userId){
        return res.status(403).json({error: `You do not have access to this task`});
    }

    next();
})

module.exports = ownership;