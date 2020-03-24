const jwt = require("jsonwebtoken");
const config = require("../config/oauth");

const generateToken = user => {
  return jwt.sign(user, config.JWT.secret, {
    expiresIn: 3600000000
  });
};

// Set User info
const setUser = request => {
  return {
    _id: request._id,
    email: request.email,
    role: request.role
  };
};

module.exports = {
  setUser,
  generateToken
};
