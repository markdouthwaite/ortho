const expect = require("chai").expect;
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");

const { deleteAllUsers, getUser, createUsers } = require("../../src/user");

const { app, SECRET } = require("../../app");

const adminUser = { username: "admin", password: uuid(), admin: true };
const defaultUser = { username: "default", password: uuid(), admin: false };

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
              expect(claim.username).to.equal(adminUser.username);
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
              expect(claim.username).to.equal(defaultUser.username);
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
          .send({ username: "imagined", password: defaultUser.password })
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
          .send({ username: defaultUser.username, password: "password" })
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
          .send({ username: defaultUser.username })
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
          .send({ username: defaultUser.username })
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
