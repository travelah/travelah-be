const logRequest = (req, res, next) => {
  console.log('Terjadi rerquest ke PATH: ', req.path);
  next();
};
module.exports = logRequest;
