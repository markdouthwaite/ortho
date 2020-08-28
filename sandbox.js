const mongoose = require("mongoose");
const User = require("./models/user");
const auth = require("./legacy/src/auth");
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

const Auth = auth("secret", { expiresIn: 3600, algorithm: "HS256" });
const password = "1";
mongoose.set("useCreateIndex", true);
mongoose
  .connect("mongodb://localhost:27017/auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "users",
  })
  .then(
    createUser("1", password, false, (err, user) => {
      Auth(user, "1", (err, token) => {
        console.log(token);
      });
    })
  );
