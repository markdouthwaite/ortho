const Router = require("express").Router;
const UserController = require("../controllers/user");

const router = Router();

async function adminOnlyResource(req, res, next) {
  if (req.user.admin) {
    next();
  } else {
    res.status(403).send("You do not have permission to use this resource.");
  }
}

async function restrictedResource(req, res, next) {
  if (req.user.admin || req.user.username === req.params.username) {
    next();
  } else {
    res.status(403).send("You do not have permission to use this resource.");
  }
}

router.get(
  "/account/:username",
  restrictedResource,
  UserController.getUserHandler
);
router.post("/account", adminOnlyResource, UserController.createUserHandler);
router.delete(
  "/account/:username",
  adminOnlyResource,
  UserController.deleteUserHandler
);

module.exports = {
  UserRouter: router,
};
