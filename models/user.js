const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, maxlength: 256, unique: true },
  admin: { type: Boolean, required: true, default: false },
  hash: { type: String, required: true, maxlength: 512 },
  salt: { type: String, required: true, maxlength: 512 },
});

UserSchema.methods.claim = function () {
  return {
    id: this.id,
    admin: this.admin,
  };
};

module.exports = mongoose.model("User", UserSchema);
