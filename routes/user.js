const Router = require("express").Router;
const UserController = require("../controllers/user");

async function adminOnlyResource(req, res, next) {
  if (req.user.admin) {
    next();
  } else {
    res.status(403).send("You do not have permission to use this resource.");
  }
}

const router = Router();

router.get("/account/:id$/", UserController.getUserHandler);
router.get("/list", adminOnlyResource, UserController.getUserListHandler);
router.post("/account", adminOnlyResource, UserController.createUserHandler);
router.delete(
  "/account/:id$/",
  adminOnlyResource,
  UserController.deleteUserHandler
);

module.exports = { UserRouter: router };
