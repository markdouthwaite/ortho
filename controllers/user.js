const { getUser, createUser } = require("../src/user");

function getUserHandler(req, res) {
  getUser(req.params.id, (err, user) => {
    if (err) {
      res.status(500).send(err.message);
    } else if (!user) {
      res.status(400).send(`No such user '${req.body.id}`);
    } else {
      res.status(200).json({ id: user.id, admin: user.admin });
    }
  });
}

function createUserHandler(req, res) {
  const user = req.body;
  if (!user.id || !user.password) {
    res.status(400).send(`Could not create user, found missing credentials.`);
  } else {
    createUser(user.id, user.password, user.admin || false, (err, user) => {
      res.status(201).send(`User '${user.id}' created.`);
    });
  }
}

function deleteUserHandler(req, res) {
  if (!req.params.id) {
    res.status(400).send(`Could not delete user: no user id provided.`);
  } else {
    deleteUser(req.params.id, (err, _) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(204).send(`User '${req.params.id}' deleted`);
      }
    });
  }
}

module.exports = {
  getUserHandler,
  createUserHandler,
  deleteUserHandler,
};
