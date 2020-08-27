const Router = require("express").Router;
const { MongoAuthHandler } = require("../controllers/auth");

const router = (secret, options) => {
  const auth = Router();
  auth.post("/", MongoAuthHandler(secret, options));
  return auth;
};

module.exports = {
  AuthRouter: router,
};
