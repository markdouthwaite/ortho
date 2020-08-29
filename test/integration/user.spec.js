const async = require("async");
const expect = require("chai").expect;
const request = require("supertest");
const jwt = require("jsonwebtoken");
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

const adminUser = { id: "admin", password: uuid(), admin: true };
const defaultUser = { id: "default", password: uuid(), admin: false };
const Auth = auth(SECRET, { expiresIn: 3600, algorithm: "HS256" });

describe("User management", () => {
  beforeEach((done) => {
    createUsers([adminUser, defaultUser]).then(() => {
      done();
    });
  });

  afterEach((done) => {
    deleteAllUsers(() => done());
  });

  describe("POST /v1/user/account", () => {
    context("Using valid credentials", () => {
      it("Should return (201) with a correct message", (done) => {
        getToken(adminUser, (_, token) => {
          request(app)
            .post(`/v1/user/account/`)
            .set({ Authorization: token })
            .send({
              id: "jane.smith@example.com",
              password: "0123456789",
              admin: false,
            })
            .then((res) => {
              expect(res.status).to.equal(201);
              expect(res.text).to.equal(
                "User 'jane.smith@example.com' created."
              );
              getUser("jane.smith@example.com", (err, user) => {
                expect(user.id).to.equal("jane.smith@example.com");
                done();
              });
            });
        });
      });
    });
  });

  describe("GET /v1/user/account/:id", () => {
    context("Using valid credentials", () => {
      it("Should return (200) with given user's info if requested by given user", (done) => {
        getToken(defaultUser, (_, token) => {
          request(app)
            .get(`/v1/user/account/${defaultUser.id}`)
            .set({ Authorization: token })
            .then((res) => {
              expect(res.status).to.equal(200);
              expect(res.body.id).to.equal(defaultUser.id);
              expect(res.body.admin).to.equal(false);
              done();
            });
        });
      });
      it("Should return (200) with given user's info if requested by admin", (done) => {
        getToken(adminUser, (_, token) => {
          request(app)
            .get(`/v1/user/account/${defaultUser.id}`)
            .set({ Authorization: token })
            .then((res) => {
              expect(res.status).to.equal(200);
              expect(res.body.id).to.equal(defaultUser.id);
              expect(res.body.admin).to.equal(false);
              done();
            });
        });
      });
      it("Should fail (403) when requesting info for another user as a non-admin", (done) => {
        getToken(defaultUser, (_, token) => {
          request(app)
            .get(`/v1/user/account/${adminUser.id}`)
            .set({ Authorization: token })
            .then((res) => {
              expect(res.status).to.equal(403);
              done();
            });
        });
      });
    });
    context("Using invalid credentials", () => {
      it("Should return (401) if invalid token provided", (done) => {
        request(app)
          .get(`/v1/user/account/${defaultUser.id}`)
          .set({ Authorization: "invalid_token" })
          .then((res) => {
            expect(res.status).to.equal(401);
            done();
          });
      });
      it("Should return (401) if no token provided", (done) => {
        request(app)
          .get(`/v1/user/account/${defaultUser.id}`)
          .then((res) => {
            expect(res.status).to.equal(401);
            done();
          });
      });
    });
  });
});
