// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next){
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
};

module.exports = errorHandler;