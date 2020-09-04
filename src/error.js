class HTTPError extends Error {
  constructor(code, title, message) {
    super(`${title}: ${message}`);
    this.code = code;
    this.title = title;
    this.message = message;
  }

  toJSON() {
    return {
      title: this.title,
      message: this.message,
    };
  }
}

module.exports = {
  HTTPError,
};
