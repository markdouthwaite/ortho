const jwt = require("jsonwebtoken");
const { verifyPassword } = require("../../src/util");
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
      callback(new AuthError("Authentication failed: unknown error."));
    }
  };
}

function authenticate(credentials, getter, secret, options, callback) {
  if (!credentials.id || !credentials.password) {
    return callback(new AuthError("Invalid credentials: missing credentials."));
  }

  if (!secret) return callback(new AuthError("No secret provided."));

  if (typeof options === "function" && !callback) {
    callback = options;
  }

  return getter(credentials.id, (err, user) => {
    if (err != null) {
      return callback(new AuthError("Failed to acquire user: " + err.message));
    }
    if (!user)
      return callback(
        new AuthError("Invalid credentials: user id or password incorrect.")
      );
    if (!verifyPassword(credentials.password, user.salt, user.hash)) {
      return callback(
        new AuthError("Invalid credentials: user id or password incorrect.")
      );
    } else {
      const token = jwt.sign(user.claim(), secret, options);
      return callback(null, `Bearer ${token}`);
    }
  });
}

module.exports = auth;
