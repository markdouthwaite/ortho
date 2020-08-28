const jwt = require("jsonwebtoken");
const { verifyPassword } = require("./util");
class AuthError extends Error {}

function auth(secret, options) {
  return (user, password, callback) => {
    if (!password) {
      callback(new AuthError("Authentication failed: missing credentials."));
    } else if (!user) {
      callback(new AuthError("Authentication failed: unknown user."));
    } else if (verifyPassword(password, user.salt, user.hash)) {
      const token = jwt.sign(user.claim(), secret, options);
      callback(null, `Bearer ${token}`);
    } else {
      callback(
        new AuthError("Authentication failed: incorrect username or password.")
      );
    }
  };
}

module.exports = auth;
