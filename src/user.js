const User = require("../models/user");
const { encryptPassword } = require("../src/utils");

async function getUser(id, callback) {
  return User.findOne({ id: id }, callback);
}

async function getUserList(count, callback) {
  if (typeof count === "function") {
    await User.find({}, count);
  } else if (!count) {
    await User.find({}, callback);
  } else {
    const q = await User.find({}).select("id -_id").limit(count);
    await q.exec(callback);
  }
}

function unpackUserList(list) {
  return list.map((_) => ({ id: _.id, admin: _.admin }));
}

async function createUsers(userList, callback) {}

async function createUser(id, password, admin, callback) {
  const user = new User({
    id: id,
    admin: admin,
  });
  const { salt, hash } = encryptPassword(password);
  user.salt = salt;
  user.hash = hash;
  return user.save().then(callback);
}

async function deleteUser(id, callback) {
  await User.deleteOne({ id: id }, (err, _) => {
    if (err) throw err;
  });
  if (callback) return callback();
}

async function deleteAllUsers() {
  await User.deleteMany({});
}

module.exports = {
  createUser,
  getUser,
  getUserList,
  deleteUser,
  deleteAllUsers,
};
