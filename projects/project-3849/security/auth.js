const jwt = require('jsonwebtoken');
const authConfig = require('./config.json');

const generateToken = (user) => {
  return jwt.sign(user, authConfig.auth.secretKey, { expiresIn: authConfig.auth.tokenExpiration });
};

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access denied. No token provided.');
  try {
    const decoded = jwt.verify(token, authConfig.auth.secretKey);
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(400).send('Invalid token.');
  }
};

module.exports = { generateToken, verifyToken };