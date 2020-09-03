const { getUser, createUser, deleteUser } = require("../src/user");
const { HTTPError } = require("../src/error");

function getUserHandler(req, res, next) {
  getUser(req.params.username, (err, user) => {
    if (err) {
      next(new HTTPError(500, "GetUserError", "internal-error"));
    } else if (!user) {
      next(new HTTPError(400, "GetUserError", "unknown-user"));
    } else {
      res.status(200).json({ username: user.username, admin: user.admin });
    }
  });
}

function createUserHandler(req, res, next) {
  const user = req.body;
  if (!user.username || !user.password) {
    next(new HTTPError(400, "CreateUserError", "missing-required-details"));
  } else {
    createUser(
      user.username,
      user.password,
      user.admin || false,
      (err, newUser) => {
        if (err || !newUser) {
          if (err.code === 11000) {
            next(
              new HTTPError(
                400,
                "CreateUserError",
                "cannot-create-existing-user"
              )
            );
          } else {
            next(new HTTPError(400, "CreateUserError", "reason-unknown"));
          }
        } else {
          res.status(201).send(`User '${user.username}' created.`);
        }
      }
    );
  }
}

function deleteUserHandler(req, res, next) {
  if (!req.params.username) {
    next(new HTTPError(400, "DeleteUserError", "invalid-username"));
  } else {
    deleteUser(req.params.username, (err, _) => {
      if (err) {
        if (err.message === "No such user.") {
          next(new HTTPError(400, "DeleteUserError", "unknown-user"));
        } else {
          next(new HTTPError(400, "DeleteUserError", "unknown-error"));
        }
      } else {
        res.status(204).send(`User '${req.params.username}' deleted`);
      }
    });
  }
}

module.exports = {
  getUserHandler,
  createUserHandler,
  deleteUserHandler,
};
