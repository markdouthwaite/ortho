const async = require("async");
const assert = require("assert");
const expect = require("chai").expect;
const request = require("supertest");
const { v4: uuid } = require("uuid");

const getAuth = require("../../src/auth");
const { app, SECRET, SECRET_ALGO, TOKEN_EXPIRY } = require("../../app");
const { createUsers, deleteAllUsers, getUser } = require("../../src/user");

describe("User management", () => {
  const users = [
    { id: "default", password: uuid(), admin: false },
    { id: "admin", password: uuid(), admin: true },
  ];

  const getAdmin = () => {
    return users.filter((_) => _.id === "admin")[0];
  };

  const getDefault = () => {
    return users.filter((_) => _.id === "default")[0];
  };

  const authUser = (user, callback) => {
    getAuth(
      user,
      getUser,
      SECRET,
      { algorithm: SECRET_ALGO, expiresIn: TOKEN_EXPIRY },
      callback
    );
  };

  function sleepThenAuth(user, timeout, callback) {
    setTimeout(() => {
      authUser(user, callback);
    }, timeout);
  }

  const adminUser = getAdmin();

  const defaultUser = getDefault();

  beforeEach(async () => {
    await createUsers(users);
  });

  afterEach((done) => {
    deleteAllUsers(() => done());
  });

  describe("GET /v1/user/account", () => {
    it("Should not return the resource if the resource id does not match authed user's id", (done) => {
      sleepThenAuth(defaultUser, 15, (_, jwt) => {
        request(app)
          .get(`/v1/user/account/${adminUser.id}`)
          .set({ Authorization: jwt })
          .then((res) => {
            expect(res.status).to.equal(403);
            expect(res.text).to.equal(
              "You do not have permission to use this resource."
            );
            done();
          });
      });
    });

    it("Should return the resource if the resource id matches authed in user's id", (done) => {
      sleepThenAuth(defaultUser, 15, (_, jwt) => {
        request(app)
          .get(`/v1/user/account/${defaultUser.id}`)
          .set({ Authorization: jwt })
          .then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body.id).to.equal(defaultUser.id);
            done();
          });
      });
    });

    it("Should not return the resource if the current user is unauthenticated", (done) => {
      setTimeout(() => {
        request(app)
          .get(`/v1/user/account/${adminUser.id}`)
          .set({ Authorization: "random_token" })
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(res.text).to.equal("Failed to authenticate credentials.");
            done();
          });
      }, 5);
    });

    it("Should return the resource if the authed user is admin", (done) => {
      sleepThenAuth(adminUser, 15, (_, jwt) => {
        request(app)
          .get(`/v1/user/account/${adminUser.id}`)
          .set({ Authorization: jwt })
          .then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body.id).to.equal(adminUser.id);
            done();
          });
      });
    });
  });

  // describe("GET /v1/user/list", () => {
  //   it("Should fail with 401 and not return a list of users if user is not logged in.", () => {
  //     return request(app)
  //       .get(`/v1/user/list`)
  //       .then((res) => {
  //         expect(res.status).to.equal(401);
  //         expect(res.text).to.equal("Failed to authenticate credentials.");
  //       });
  //   });
  //
  //   it("Should fail with 401 and not return a list of users if user has invalid token.", () => {
  //     return request(app)
  //       .get(`/v1/user/list`)
  //       .set({ Authorization: "invalid_token" })
  //       .then((res) => {
  //         expect(res.status).to.equal(401);
  //         expect(res.text).to.equal("Failed to authenticate credentials.");
  //       });
  //   });
  //
  //   it("Should fail with 403 and not return a list of users if user is not admin.", () => {
  //     return request(app)
  //       .get(`/v1/user/list`)
  //       .set({ Authorization: jwtSet.default })
  //       .then((res) => {
  //         expect(res.status).to.equal(403);
  //         expect(res.text).to.equal(
  //           "You do not have permission to use this resource."
  //         );
  //       });
  //   });
  //
  //   it("Should return a list of users if user is admin.", () => {
  //     return request(app)
  //       .get(`/v1/user/list`)
  //       .set({ Authorization: jwtSet.admin })
  //       .then((res) => {
  //         expect(res.status).to.equal(200);
  //         expect(res.body.length).to.equal(2);
  //         res.body.forEach((_) => expect(_).to.haveOwnProperty("id"));
  //       });
  //   });
  // });

  describe("POST /v1/user/account", () => {
    it("Should be able to create user if user is admin", (done) => {
      sleepThenAuth(adminUser, 15, (_, jwt) => {
        request(app)
          .post(`/v1/user/account`)
          .set({ Authorization: jwt })
          .send({ id: "newUser", password: "newPassword", admin: true })
          .then((res) => {
            expect(res.status).to.equal(201);
            expect(res.text).to.equal("User 'newUser' created.");
            done();
          });
      });
    });

    it("Should not be able to create user if user is not admin", (done) => {
      sleepThenAuth(defaultUser, 15, (_, jwt) => {
        request(app)
          .post(`/v1/user/account`)
          .set({ Authorization: jwt })
          .send({ id: "newUser", password: "newPassword", admin: true })
          .then((res) => {
            expect(res.status).to.equal(403);
            expect(res.text).to.equal(
              "You do not have permission to use this resource."
            );
            done();
          });
      });
    });

    // it("Should not be able to create user if user is not logged in", () => {
    //   return request(app)
    //     .post(`/v1/user/account`)
    //     .send({ id: "newUser", password: "newPassword", admin: true })
    //     .then((res) => {
    //       expect(res.status).to.equal(401);
    //       expect(res.text).to.equal("Failed to authenticate credentials.");
    //     });
    // });
  });

  describe("DELETE /v1/user/account", () => {
    it("Should be able to delete user if user is admin", (done) => {
      sleepThenAuth(adminUser, 15, (_, jwt) => {
        request(app)
          .delete(`/v1/user/account/${defaultUser.id}`)
          .set({ Authorization: jwt })
          .then((res) => {
            expect(res.status).to.equal(204);
            getUser(defaultUser.id, (err, user) => {
              expect(user).to.equal(null);
              done();
            });
          });
      });
    });

    it("Should not be able to delete user if user is not admin", (done) => {
      sleepThenAuth(defaultUser, 15, (_, jwt) => {
        request(app)
          .delete(`/v1/user/account/${defaultUser.id}`)
          .set({ Authorization: jwt })
          .then((res) => {
            expect(res.status).to.equal(403);
            getUser(defaultUser.id, (err, user) => {
              expect(user).to.not.equal(null);
              done();
            });
          });
      });
    });

    it("Should not be able to delete user if user provides no token", (done) => {
      setTimeout(() => {
        request(app)
          .delete(`/v1/user/account/${defaultUser.id}`)
          .then((res) => {
            expect(res.status).to.equal(401);
            getUser(defaultUser.id, (err, user) => {
              expect(user).to.not.equal(null);
              done();
            });
          });
      }, 15);
    });

    it("Should not be able to delete user if user provides invalid token", (done) => {
      setTimeout(() => {
        request(app)
          .delete(`/v1/user/account/${defaultUser.id}`)
          .set({ Authorization: "random_token" })
          .then((res) => {
            expect(res.status).to.equal(401);
            getUser(defaultUser.id, (err, user) => {
              expect(user).to.not.equal(null);
              done();
            });
          });
      }, 15);
    });
  });
});
