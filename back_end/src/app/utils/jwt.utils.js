const jwt = require('jsonwebtoken');
const config = require('../../config');

const createToken = (payload, secret = config.jwt.secret, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

const verifyToken = (token, secret = config.jwt.secret) => {
  return jwt.verify(token, secret);
};

module.exports = {
  createToken,
  verifyToken,
};
