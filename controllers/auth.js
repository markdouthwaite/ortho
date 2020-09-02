const { getUser } = require("../src/user");
const auth = require("../src/auth");

/**
 * Authentication handler for requests to Ortho
 * @param {string} secret - The secret key used by the service.
 * @param {object} options - Configuration options for authentication. See src/auth for more information.
 * @returns {function(...[*])} - The returned handler.
 */
function AuthHandler(secret, options) {
  const Auth = auth(secret, options);
  return (req, res) => {
    getUser(req.body.username, (err, user) => {
      if (err) {
        res.status(500).send(`Authentication failed: ${err.message}`);
      } else {
        Auth(user, req.body.password, (err, token) => {
          if (err) {
            res.status(401).send(err.message);
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
