const { getUser, createUser, deleteUser } = require("../src/user");

function getUserHandler(req, res) {
  getUser(req.params.username, (err, user) => {
    if (err) {
      res.status(500).send(err.message);
    } else if (!user) {
      res.status(400).send(`No such user '${req.body.username}`);
    } else {
      res.status(200).json({ username: user.username, admin: user.admin });
    }
  });
}

function createUserHandler(req, res) {
  const user = req.body;
  if (!user.username || !user.password) {
    res.status(400).send(`Could not create user, found missing credentials.`);
  } else {
    createUser(
      user.username,
      user.password,
      user.admin || false,
      (err, user) => {
        res.status(201).send(`User '${user.username}' created.`);
      }
    );
  }
}

function deleteUserHandler(req, res) {
  if (!req.params.username) {
    res.status(400).send(`Could not delete user: no user id provided.`);
  } else {
    deleteUser(req.params.username, (err, _) => {
      if (err) {
        res.status(500).send(err.message);
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
