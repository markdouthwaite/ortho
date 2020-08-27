const Users = require("../models/users");

async function getUser(id, callback) {
  Users.findOne({ id: id }, callback);
}

async function getUsers(count, callback) {
  if (typeof count === "function") {
    await Users.find({}, count);
  } else if (!count) {
    await Users.find({}, callback);
  } else {
    const q = await Users.find({}).select("id -_id").limit(count);
    await q.exec(callback);
  }
}

async function createUser(id, password, admin, callback) {
  const newUser = new Users({
    id: id,
    admin: admin,
  });
  await newUser.setPassword(password);
  return newUser.save();
}

async function updateUser(id, options) {}

async function deleteUser(id, callback) {
  await Users.deleteOne({ id: id }, (err, _) => {
    if (err) throw err;
  });
  if (callback) callback();
}

async function deleteAllUsers() {
  await Users.deleteMany({});
}

module.exports = {
  createUser,
  deleteUser,
  deleteAllUsers,
  getUser,
  getUsers,
};
