const Router = require("express").Router;
const { AuthHandler } = require("../controllers/auth");

const router = (secret, options) => {
  const auth = Router();
  auth.post("/", AuthHandler(secret, options));
  return auth;
};

module.exports = {
  AuthRouter: router,
};
