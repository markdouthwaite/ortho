const { getUser, getUsers, createUser, deleteUser } = require("../src/user");

function unpackUserList(list) {
  return list.map((_) => ({ id: _.id, admin: _.admin }));
}

function getUserHandler(req, res) {
  if (req.user.id === req.params.id || req.user.admin) {
    getUser(req.params.id, (err, user) => {
      if (err || !user) {
        res.status(404).send(`No known user with id '${req.params.id}'.`);
      } else {
        res.status(200).json({ id: user.id });
      }
    });
  } else {
    res.status(403).send("You do not have permission to use this resource.");
  }
}

function getUserListHandler(req, res) {
  getUsers(req.params.count, (err, userList) => {
    if (err) {
      res.status(500).send(`Failed to fetch user list. ${err}`);
    } else {
      res.status(200).json(unpackUserList(userList));
    }
  });
}

async function createUserHandler(req, res) {
  const user = req.body;
  if (!user.id || !user.password) {
    res.status(400).send(`Could not create user, found missing credentials.`);
  } else {
    createUser(user.id, user.password, user.admin || false, (err, user) => {
      res.status(201).send(`User '${user.id}' created.`);
    });
  }
}

async function deleteUserHandler(req, res) {
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
  getUserListHandler,
  createUserHandler,
  deleteUserHandler,
};
