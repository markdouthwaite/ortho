const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, maxlength: 256, unique: true },
  admin: { type: Boolean, required: true, default: false },
  hash: { type: String, required: true, maxlength: 512 },
  salt: { type: String, required: true, maxlength: 512 },
});

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 128, "sha512")
    .toString("hex");
};

UserSchema.methods.verifyPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 128, "sha512")
    .toString("hex");
  return this.hash === hash;
};

module.exports = mongoose.model("User", UserSchema);
