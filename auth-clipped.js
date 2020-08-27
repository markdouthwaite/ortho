const jwt = require("jsonwebtoken");
const User = require("../models/users");

class AuthError extends Error {}

const auth = async (id, password, secret, options, callback) => {
  if (!id || !password) {
    callback(new AuthError("Invalid user id or password provided."));
    return;
  }

  await User.findOne({ id: id }, (err, user) => {
    if (!user) {
      callback(new AuthError(`Unknown user '${id}'.`));
    } else if (!user.verifyPassword(password)) {
      callback(new AuthError(`Invalid password provided for id '${id}'.`));
    } else {
      {
        const claims = {
          id: user.id,
          admin: user.admin,
        };
        const token = jwt.sign(claims, secret, options);
        callback(err, `Bearer ${token}`);
      }
    }
  });
};

const authHandler = (secret, options) => async (req, res) => {
  const id = req.body.id;
  const password = req.body.password;
  await auth(id, password, secret, options, (err, token) => {
    if (err) {
      res.status(401).send(`Failed to authenticate credentials.`);
    } else {
      res.status(200).json({ token: token });
    }
  });
};

module.exports = { authHandler, auth };
