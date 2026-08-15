const jwt = require('jsonwebtoken');
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access denied');
  try {
    const decoded = jwt.verify(token, 'stark_secret');
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token');
  }
};
module.exports = authenticate;