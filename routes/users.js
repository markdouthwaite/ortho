const Router = require("express").Router;
const UserController = require("../controllers/users");

const router = Router();

async function adminOnlyResource(req, res, next) {
  if (req.user.admin) {
    next();
  } else {
    res.status(403).send("You do not have permission to use this resource.");
  }
}

function unpackUserList(list) {
  return list.map((_) => ({ id: _.id, admin: _.admin }));
}

async function getUserHandler(req, res) {
  if (req.user.id === req.params.id || req.user.admin) {
    await UserController.getUser(req.params.id, (err, user) => {
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
  await UserController.getUsers(req.params.count, (err, userList) => {
    if (err) {
      res.status(500).send(`Failed to fetch user list. ${err}`);
    } else {
      res.status(200).json(unpackUserList(userList));
    }
  });
}

router.get("/account/:id$/", getUserHandler);
router.get("/list", adminOnlyResource, getUserListHandler);
// router.post("/account/", creat);

module.exports = router;
