const accessControl = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
};
module.exports = accessControl;