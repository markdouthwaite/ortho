const async = require("async");
const expect = require("chai").expect;
const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");

const auth = require("../../src/auth");
const { deleteAllUsers, getUser, createUser } = require("../../src/user");

function createUsers(users, callback) {
  return async.parallel(
    users.map((_) => async () =>
      createUser(_.id, _.password, _.admin, callback)
    )
  );
}

function getToken(credentials, callback) {
  getUser(credentials.id, (err, user) => {
    Auth(user, credentials.password, callback);
  });
}

const adminUser = { id: "admin", password: uuid(), admin: true };
const defaultUser = { id: "default", password: uuid(), admin: false };
const Auth = auth("secret", { expiresIn: 3600, algorithm: "HS256" });

describe("Authentication resource", () => {
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
    createUsers([adminUser, defaultUser]).then(() => {
      done();
    });
  });

  afterEach((done) => {
    deleteAllUsers(() => done());
  });

  describe("POST /v1/auth", () => {
    context("Using valid credentials", () => {
      it("Should return a valid token for admin", (done) => {
        getToken(defaultUser, (err, token) => {
          const parts = token.split(" ");
          jwt.verify(parts[1], "secret", (err, claim) => {
            expect(err).to.equal(null);
            expect(claim.id).to.equal(defaultUser.id);
            done();
          });
        });
      });
      it("Should return a valid token for non-admin", () => {});
    });
    context("Using invalid credentials", () => {
      it("Should fail to authenticate when user ID is incorrect", () => {});
      it("Should fail to authenticate when user ID is not provided", () => {});
      it("Should fail to authenticate when password is incorrect", () => {});
      it("Should fail to authenticate when password is not provided", () => {});
      it("Should fail to authenticate when user ID and password are incorrect", () => {});
      it("Should fail to authenticate when user ID and password are not provided", () => {});
    });
  });
});
