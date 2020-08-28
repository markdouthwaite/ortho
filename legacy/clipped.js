const jwt = require("jsonwebtoken");
const async = require("async");
const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");

const User = require("../models/user");
const { encryptPassword, verifyPassword } = require("../src/util");

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

function deleteAll(callback) {
  return User.deleteMany({}, callback);
}

function createUsers(count, callback) {
  return async.parallel(
    [...Array(count || 1).keys()].map((_) => async () =>
      createUser(_.toString(), "password" + _.toString(), false, callback)
    )
  );
}

function authenticate(secret, options) {
  return (user, credentials, callback) => {
    if (verifyPassword(credentials.password, user.salt, user.hash)) {
      const token = jwt.sign(user.claim(), secret, options);
      return callback(null, `Bearer ${token}`);
    }
  };
}

Auth = authenticate("secret", { expiresIn: 3600, algorithm: "HS256" });

describe("test", () => {
  before((done) => {
    mongoose.set("useCreateIndex", true);
    mongoose
      .connect("mongodb://localhost:27017/auth", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "users",
      })
      .then(done());
  });

  beforeEach((done) => {
    createUsers(10).then(() => {
      done();
    });
  });

  afterEach((done) => {
    deleteAll(() => done());
  });

  it("should work", () => {
    const creds = { id: "1", password: "password1" };
    return getUser("1", (err, user) =>
      Auth(user, creds, (err, token) => console.log(token))
    );
  });
});

// createUsers(50).then(console.log);

// getUser().then(console.log);
