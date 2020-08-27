const { getUser, getUsers } = require("../src/user");

function unpackUserList(list) {
  return list.map((_) => ({ id: _.id, admin: _.admin }));
}

async function getUserHandler(req, res) {
  if (req.user.id === req.params.id || req.user.admin) {
    await getUser(req.params.id, (err, user) => {
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

async function getUserListHandler(req, res) {
  await getUsers(req.params.count, (err, userList) => {
    if (err) {
      res.status(500).send(`Failed to fetch user list. ${err}`);
    } else {
      res.status(200).json(unpackUserList(userList));
    }
  });
}

module.exports = {
  getUserHandler,
  getUserListHandler,
};
