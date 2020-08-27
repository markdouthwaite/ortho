const crypto = require("crypto");

const DIGEST = "SHA512";
const KEY_LENGTH = 256;
const ITERATIONS = 10000;

function verifyPassword(password, salt, hash) {
  const newHash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return hash === newHash;
}

function encryptPassword(password) {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");
  return { salt, hash };
}

module.exports = {
  verifyPassword,
  encryptPassword,
};
