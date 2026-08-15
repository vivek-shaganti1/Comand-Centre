const request = require('supertest');
const app = require('../app');
const auth = require('./auth');
const jwt = require('jsonwebtoken');
const authConfig = require('./config.json');

describe('Auth Middleware', () => {
  it('should generate a token', () => {
    const user = { id: 1, name: 'John Doe' };
    const token = auth.generateToken(user);
    expect(token).not.toBeNull();
  });

  it('should verify a token', () => {
    const user = { id: 1, name: 'John Doe' };
    const token = jwt.sign(user, authConfig.auth.secretKey, { expiresIn: authConfig.auth.tokenExpiration });
    const req = { header: () => token };
    const res = {};
    const next = jest.fn();
    auth.verifyToken(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});