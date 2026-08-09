const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');

const authenticate = asyncHandler( async (req, res, next) => {
    const header = req.headers.authorization;
    if(!header){
        return res.status(401).json({error: 'Missing athorization header'})
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
});

module.exports = authenticate;