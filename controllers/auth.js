const { getUser } = require("../src/user");
const { HTTPError } = require("../src/error");
const auth = require("../src/auth");

/**
 * Authentication handler for requests to Ortho
 * @param {string} secret - The secret key used by the service.
 * @param {object} options - Configuration options for authentication. See src/auth for more information.
 * @returns {function(...[*])} - The returned handler.
 */
function AuthHandler(secret, options) {
  const Auth = auth(secret, options);
  return (req, res, next) => {
    getUser(req.body.username, (err, user) => {
      if (err) {
        next(new HTTPError(500, "AuthenticationError", "unknown-error"));
      } else {
        Auth(user, req.body.password, (err, token) => {
          if (err) {
            next(
              new HTTPError(401, "AuthenticationError", "invalid-credentials")
            );
          } else {
            res.status(200).json({ token: token });
          }
        });
      }
    });
  };
}

module.exports = {
  AuthHandler,
};
