const { encryptPassword } = require("./util");
const User = require("../models/user");

function getUser(id, callback) {
  return User.findOne({ id: id }, callback);
}

function createUser(id, password, admin, callback) {
  const { salt, hash } = encryptPassword(password);
  const user = new User({
    id: id,
    admin: admin,
    salt: salt,
    hash: hash,
  });
  return user.save(callback);
}

function deleteAllUsers(callback) {
  return User.deleteMany({}, callback);
}

module.exports = {
  getUser,
  createUser,
  deleteAllUsers,
};
