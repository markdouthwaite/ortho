class HTTPError extends Error {
  constructor(code, title, reason) {
    super(`${title}: ${reason}`);
    this.code = code;
    this.title = title;
    this.reason = reason;
  }

  toJSON() {
    return {
      title: this.title,
      reason: this.reason,
    };
  }
}

function httpErrorHandler(err, req, res, next) {
  if (err instanceof HTTPError) {
    res.status(err.code).json(err.toJSON());
  } else {
    next();
  }
}

module.exports = {
  HTTPError,
  httpErrorHandler,
};
