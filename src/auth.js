const jwt = require("jsonwebtoken");
const { verifyPassword } = require("./utils");
class AuthError extends Error {}

async function authenticate(credentials, getter, secret, options, callback) {
  if (!credentials.id || !credentials.password) {
    return callback(
      new AuthError("Invalid credentials: no credentials provided.")
    );
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

module.exports = authenticate;
