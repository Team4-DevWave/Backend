module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //catch error and pass it to the next function (globalerror middleware)
  };
};
