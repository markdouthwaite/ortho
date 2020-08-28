const async = require("async");
const expect = require("chai").expect;
const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");

const auth = require("../../src/auth");
const { deleteAllUsers, getUser, createUser } = require("../../src/user");

const { app, SECRET } = require("../../app");

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

// getToken(defaultUser, (err, token) => {
//
// });

const adminUser = { id: "admin", password: uuid(), admin: true };
const defaultUser = { id: "default", password: uuid(), admin: false };
const Auth = auth("secret", { expiresIn: 3600, algorithm: "HS256" });

describe("Authentication", () => {
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
      it("Should return (200) with a correct token for admin", (done) => {
        request(app)
          .post("/v1/auth")
          .send(adminUser)
          .then((res) => {
            const parts = res.body.token.split(" ");
            jwt.verify(parts[1], SECRET, (err, claim) => {
              expect(err).to.equal(null);
              expect(claim.id).to.equal(adminUser.id);
              expect(claim.admin).to.equal(true);
              done();
            });
          });
      });
      it("Should return (200) with a correct token for non-admin", (done) => {
        request(app)
          .post("/v1/auth")
          .send(defaultUser)
          .then((res) => {
            const parts = res.body.token.split(" ");
            jwt.verify(parts[1], SECRET, (err, claim) => {
              expect(err).to.equal(null);
              expect(claim.id).to.equal(defaultUser.id);
              expect(claim.admin).to.equal(false);
              done();
            });
          });
      });
    });
    context("Using invalid credentials", () => {
      it("Should fail (401) to authenticate when user ID is incorrect", (done) => {
        request(app)
          .post("/v1/auth")
          .send({ id: "imagined", password: defaultUser.password })
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(Object.keys(res.body).length).to.equal(0);
            expect(res.text).to.equal(
              "Authentication failed: invalid credentials"
            );
            done();
          });
      });
      it("Should fail (401) to authenticate when user ID is not provided", (done) => {
        request(app)
          .post("/v1/auth")
          .send({ password: "password" })
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(Object.keys(res.body).length).to.equal(0);
            expect(res.text).to.equal(
              "Authentication failed: invalid credentials"
            );
            done();
          });
      });
      it("Should fail (401) to authenticate when password is incorrect", (done) => {
        request(app)
          .post("/v1/auth")
          .send({ id: defaultUser.id, password: "password" })
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(Object.keys(res.body).length).to.equal(0);
            expect(res.text).to.equal(
              "Authentication failed: invalid credentials"
            );
            done();
          });
      });
      it("Should fail (401) to authenticate when password is not provided", (done) => {
        request(app)
          .post("/v1/auth")
          .send({ id: defaultUser.id })
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(Object.keys(res.body).length).to.equal(0);
            expect(res.text).to.equal(
              "Authentication failed: invalid credentials"
            );
            done();
          });
      });
      it("Should fail (401) to authenticate when user ID and password are incorrect", (done) => {
        request(app)
          .post("/v1/auth")
          .send({ id: defaultUser.id })
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(Object.keys(res.body).length).to.equal(0);
            expect(res.text).to.equal(
              "Authentication failed: invalid credentials"
            );
            done();
          });
      });
      it("Should fail (401) to authenticate when user ID and password are not provided", (done) => {
        request(app)
          .post("/v1/auth")
          .send({})
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(Object.keys(res.body).length).to.equal(0);
            expect(res.text).to.equal(
              "Authentication failed: invalid credentials"
            );
            done();
          });
      });
    });
  });
});
