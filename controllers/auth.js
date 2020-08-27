const { getUser } = require("../src/user");
const authenticate = require("../src/auth");

const AuthHandler = (secret, options, getter) => (req, res) => {
  return authenticate(req.body, getter, secret, options, (err, token) => {
    if (err != null) {
      res.status(401).send(`${err.message}`);
    } else {
      res.status(200).json({
        token: token,
      });
    }
  });
};

const MongoAuthHandler = (secret, options) =>
  AuthHandler(secret, options, getUser);

module.exports = {
  AuthHandler,
  MongoAuthHandler,
};
