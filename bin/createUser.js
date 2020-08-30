const mongoose = require("mongoose");
const User = require("./models/user");

const { encryptPassword, verifyPassword } = require("./src/util");

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

mongoose.set("useCreateIndex", true);
mongoose
  .connect("mongodb://localhost:27017/auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "users",
  })
  .then(
    createUser("mark@douthwaite.io", "hello_world", true, (err, user) => {
      mongoose.disconnect();
    })
  );
