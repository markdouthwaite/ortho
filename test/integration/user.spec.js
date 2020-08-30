const expect = require("chai").expect;
const request = require("supertest");
const { v4: uuid } = require("uuid");

const auth = require("../../src/auth");
const { deleteAllUsers, getUser, createUsers } = require("../../src/user");

const { app, SECRET } = require("../../app");

function getToken(credentials, callback) {
  getUser(credentials.username, (err, user) => {
    Auth(user, credentials.password, callback);
  });
}

const adminUser = { username: "admin", password: uuid(), admin: true };
const defaultUser = { username: "default", password: uuid(), admin: false };
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
      it("Should return (201) with correct message when logged in as an admin", (done) => {
        const userId = uuid();
        const password = uuid();
        getToken(adminUser, (_, token) => {
          request(app)
            .post(`/v1/user/account/`)
            .set({ Authorization: token })
            .send({
              username: userId,
              password: password,
              admin: false,
            })
            .then((res) => {
              expect(res.status).to.equal(201);
              expect(res.text).to.equal(`User '${userId}' created.`);
              getUser(userId, (err, user) => {
                expect(user.username).to.equal(userId);
                done();
              });
            });
        });
      });
      it("Should return (403) with correct error message when not logged in as an admin", (done) => {
        const userId = uuid();
        const password = uuid();
        getToken(defaultUser, (_, token) => {
          request(app)
            .post(`/v1/user/account/`)
            .set({ Authorization: token })
            .send({
              username: userId,
              password: password,
              admin: false,
            })
            .then((res) => {
              expect(res.status).to.equal(403);
              expect(res.text).to.equal(
                "You do not have permission to use this resource."
              );
              getUser(userId, (err, user) => {
                expect(user).to.equal(null);
                done();
              });
            });
        });
      });
    });
    context("Using invalid credentials", () => {
      it("Should return (401) with correct error message when using an invalid token", (done) => {
        const userId = uuid();
        const password = uuid();
        request(app)
          .post(`/v1/user/account/`)
          .set({ Authorization: "invalid_token" })
          .send({
            username: userId,
            password: password,
            admin: false,
          })
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(res.text).to.equal("Failed to authenticate credentials.");
            getUser(userId, (err, user) => {
              expect(user).to.equal(null);
              done();
            });
          });
      });
      it("Should return (401) with correct error message when providing no token", (done) => {
        const userId = uuid();
        const password = uuid();
        request(app)
          .post(`/v1/user/account/`)
          .send({
            username: userId,
            password: password,
            admin: false,
          })
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(res.text).to.equal("Failed to authenticate credentials.");
            getUser(userId, (err, user) => {
              expect(user).to.equal(null);
              done();
            });
          });
      });
    });
  });

  describe("DELETE /v1/user/account/:username", () => {
    context("Using valid credentials", () => {
      it("Should delete user and return (204) when logged in as an admin", (done) => {
        getToken(adminUser, (_, token) => {
          request(app)
            .delete(`/v1/user/account/${defaultUser.username}`)
            .set({ Authorization: token })
            .then((res) => {
              expect(res.status).to.equal(204);
              getUser(defaultUser.username, (err, user) => {
                expect(user).to.equal(null);
                done();
              });
            });
        });
      });
      it("Should not delete user and return (403) when not logged in as an admin", (done) => {
        getToken(defaultUser, (_, token) => {
          request(app)
            .delete(`/v1/user/account/${defaultUser.username}`)
            .set({ Authorization: token })
            .then((res) => {
              expect(res.status).to.equal(403);
              getUser(defaultUser.username, (err, user) => {
                expect(user.username).to.equal(defaultUser.username);
                done();
              });
            });
        });
      });
    });
    context("Using invalid credentials", () => {
      it("Should return (401) with correct error message when using an invalid token", (done) => {
        request(app)
          .post(`/v1/user/account/${defaultUser.username}`)
          .set({ Authorization: "invalid_token" })
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(res.text).to.equal("Failed to authenticate credentials.");
            getUser(defaultUser.username, (err, user) => {
              expect(defaultUser.username).to.equal(defaultUser.username);
              done();
            });
          });
      });
      it("Should return (401) with correct error message when providing no token", (done) => {
        request(app)
          .post(`/v1/user/account/${defaultUser.username}`)
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(res.text).to.equal("Failed to authenticate credentials.");
            getUser(defaultUser.username, (err, user) => {
              expect(defaultUser.username).to.equal(defaultUser.username);
              done();
            });
          });
      });
    });
  });

  describe("GET /v1/user/account/:username", () => {
    context("Using valid credentials", () => {
      it("Should return (200) with given user's info if requested by given user", (done) => {
        getToken(defaultUser, (_, token) => {
          request(app)
            .get(`/v1/user/account/${defaultUser.username}`)
            .set({ Authorization: token })
            .then((res) => {
              expect(res.status).to.equal(200);
              expect(res.body.username).to.equal(defaultUser.username);
              expect(res.body.admin).to.equal(false);
              done();
            });
        });
      });
      it("Should return (200) with given user's info if requested by admin", (done) => {
        getToken(adminUser, (_, token) => {
          request(app)
            .get(`/v1/user/account/${defaultUser.username}`)
            .set({ Authorization: token })
            .then((res) => {
              expect(res.status).to.equal(200);
              expect(res.body.username).to.equal(defaultUser.username);
              expect(res.body.admin).to.equal(false);
              done();
            });
        });
      });
      it("Should fail (403) when requesting info for another user as a non-admin", (done) => {
        getToken(defaultUser, (_, token) => {
          request(app)
            .get(`/v1/user/account/${adminUser.username}`)
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
          .get(`/v1/user/account/${defaultUser.username}`)
          .set({ Authorization: "invalid_token" })
          .then((res) => {
            expect(res.status).to.equal(401);
            done();
          });
      });
      it("Should return (401) if no token provided", (done) => {
        request(app)
          .get(`/v1/user/account/${defaultUser.username}`)
          .then((res) => {
            expect(res.status).to.equal(401);
            done();
          });
      });
    });
  });
});
