const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAuthToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpires
  });
}

function parseToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { signAuthToken, parseToken };
