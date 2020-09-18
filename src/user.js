const { encryptPassword } = require("./util");
const User = require("../models/user");

function getUser(username, callback) {
  return User.findOne({ username: username }, callback);
}

function createUser(username, password, admin, callback) {
  const { salt, hash } = encryptPassword(password);
  const user = new User({
    username: username,
    admin: admin,
    salt: salt,
    hash: hash,
  });
  return user.save(callback);
}

async function createUsers(users, callback) {
  await Promise.all(
    users.map(({ username, password, admin }) =>
      createUser(username, password, admin, callback)
    )
  );
}

function deleteUser(username, callback) {
  User.deleteOne({ username: username }, (err, msg) => {
    if (err) return callback(err);
    if (callback) {
      if (msg.deletedCount === 1) {
        return callback(null, msg);
      } else {
        return callback(new Error("No such user."));
      }
    }
  });
}

function deleteAllUsers(callback) {
  return User.deleteMany({}, callback);
}

module.exports = {
  getUser,
  createUser,
  createUsers,
  deleteUser,
  deleteAllUsers,
};
