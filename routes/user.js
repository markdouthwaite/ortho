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
  if (req.user.admin || req.user.id === req.params.id) {
    next();
  } else {
    res.status(403).send("You do not have permission to use this resource.");
  }
}

router.get("/account/:id", restrictedResource, UserController.getUserHandler);
router.post("/account", adminOnlyResource, UserController.createUserHandler);
// router.delete("/account", adminOnlyResource, UserController.getUserHandler);

module.exports = {
  UserRouter: router,
};
