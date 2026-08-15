const validator = require('validator');

const validateInput = (input) => {
  if (!input) return false;
  if (typeof input !== 'object') return false;
  for (const key in input) {
    if (typeof input[key] !== 'string') return false;
    if (!validator.trim(input[key])) return false;
  }
  return true;
};

module.exports = { validateInput };