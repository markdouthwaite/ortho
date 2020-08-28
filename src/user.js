const User = require("../models/user");
const { encryptPassword } = require("../src/utils");

function getUser(id, callback) {
  User.findOne({ id: id }, callback);
}

function getUsers(count, callback) {
  if (typeof count === "function") {
    User.find({}, count).select("id -_id");
  } else if (!count) {
    User.find({}, callback).select("id -_id");
  } else {
    User.find({}, callback).select("id -_id").limit(count);
  }
}

function unpackUserList(list) {
  return list.map((_) => ({ id: _.id, admin: _.admin }));
}

function createUsers(userList, callback) {
  return userList.map((user) => {
    createUser(user.id, user.password, user.admin, callback);
  });
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

function deleteUser(id, callback) {
  User.deleteOne({ id: id }, (err, msg) => {
    if (err) return callback(err);
    if (callback) {
      if (msg.deletedCount === 1) {
        return callback(null, msg);
      } else {
        return callback(new Error("Failed to delete user."));
      }
    }
  });
}

function deleteAllUsers(callback) {
  return User.deleteMany({}, callback);
}

module.exports = {
  createUser,
  createUsers,
  getUser,
  getUsers,
  deleteUser,
  deleteAllUsers,
};
