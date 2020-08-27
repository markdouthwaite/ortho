const Router = require("express").Router;
const { getUserHandler, getUserListHandler } = require("../controllers/user");

async function adminOnlyResource(req, res, next) {
  if (req.user.admin) {
    next();
  } else {
    res.status(403).send("You do not have permission to use this resource.");
  }
}

const router = Router();

router.get("/account/:id$/", getUserHandler);
router.get("/list", adminOnlyResource, getUserListHandler);

module.exports = router;
