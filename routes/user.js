const Router = require("express").Router;
const UserController = require("../controllers/user");
const { HTTPError } = require("../src/error");

const router = Router();

async function adminOnlyResource(req, res, next) {
  if (req.user.admin) {
    next();
  } else {
    next(
      new HTTPError(403, "AuthenticationError", "insufficient-permissions ")
    );
  }
}

async function restrictedResource(req, res, next) {
  if (req.user.admin || req.user.username === req.params.username) {
    next();
  } else {
    next(
      new HTTPError(403, "AuthenticationError", "insufficient-permissions ")
    );
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
