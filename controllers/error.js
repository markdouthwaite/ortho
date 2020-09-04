const { HTTPError } = require("../src/error");

function httpErrorHandler(err, req, res, next) {
  if (err instanceof HTTPError) {
    res.status(err.code).json(err.toJSON());
  } else {
    next();
  }
}

function authErrorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    next(new HTTPError(401, "AuthenticationError", "invalid-credentials"));
  } else {
    next();
  }
}

function invalidMethodErrorHandler(req, res, next) {
  next(
    new HTTPError(
      424,
      "InvalidMethodError",
      `cannot-call-${req.method.toLowerCase()}`
    )
  );
}

module.exports = {
  httpErrorHandler,
  invalidMethodErrorHandler,
  authErrorHandler,
};
