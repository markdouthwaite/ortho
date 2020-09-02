const jwt = require("jsonwebtoken");
const { verifyPassword } = require("./util");
class AuthError extends Error {}

/**
 * A simple authentication function, returning a signed JWT token if authentication succeeds.
 * @param {string} secret A given secret key.
 * @param {object} options A set of options to be passed to `jwt.sign`.
 * @returns {function(...[*])} A callback for authenticating a given username-password combination.
 */
function auth(secret, options) {
  const msg = "Authentication failed: invalid credentials";
  return (user, password, callback) => {
    if (!password) {
      callback(new AuthError(msg));
    } else if (!user) {
      callback(new AuthError(msg));
    } else if (verifyPassword(password, user.salt, user.hash)) {
      const token = jwt.sign(user.claim(), secret, options);
      callback(null, `Bearer ${token}`);
    } else {
      callback(new AuthError(msg));
    }
  };
}

module.exports = auth;
