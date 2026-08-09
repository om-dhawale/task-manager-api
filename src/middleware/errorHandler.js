// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({ error: `${field} already in use` });
  }

  if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: `Your token is invalid or expired` });
  }
  res.status(500).json({ error: 'Something went wrong' });
}

module.exports = errorHandler;
