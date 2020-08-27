// const assert = require("assert");
// const expect = require("chai").expect;
// const request = require("supertest");
// const { v4: uuid } = require("uuid");
//
// const { series } = require("async");
//
// const { auth: getAuth } = require("../../routes/auth");
// const { app, SECRET, SECRET_ALGO, TOKEN_EXPIRY } = require("../../app");
// const { createUser, deleteAllUsers } = require("../../controllers/users");
//
// describe("User management", () => {
//   let defaultJwt = null;
//   let adminJwt = null;
//
//   const defaultUser = { id: uuid(), password: uuid(), admin: false };
//   const adminUser = { id: uuid(), password: uuid(), admin: true };
//
//   function createUserAndAuthenticate(user, callback) {
//     createUser(user.id, user.password, user.admin).then((res) =>
//       console.log(res)
//     );
//     // createUser(user.id, user.password, user.admin, async () => {
//     // await getAuth(
//     //   user.id,
//     //   user.password,
//     //   SECRET,
//     //   {
//     //     expiresIn: TOKEN_EXPIRY,
//     //     algorithm: SECRET_ALGO,
//     //   },
//     //   callback
//     // );
//     // });
//   }
//
//   beforeEach(async () => {
//     createUserAndAuthenticate(defaultUser);
//     // await series([
//     //   createUserAndAuthenticate(defaultUser, (_, jwt) => {
//     //     defaultJwt = jwt;
//     //   }),
//     //   createUserAndAuthenticate(adminUser, (_, jwt) => {
//     //     adminJwt = jwt;
//     //   }),
//     // ]);
//   });
//
//   describe("GET /v1/user/account", () => {
//     it("Should not return the resource if the resource id does not match authed user's id.", () => {
//       return request(app)
//         .get(`/v1/user/account/${adminUser.id}`)
//         .set({ Authorization: defaultJwt })
//         .then((res) => {
//           expect(res.status).to.equal(403);
//           expect(res.text).to.equal(
//             "You do not have permission to use this resource."
//           );
//         });
//     });
//
//     // it("Should return the resource if the resource id matches authed in user's id.", () => {
//     //   return request(app)
//     //     .get(`/v1/user/account/${defaultUser.id}`)
//     //     .set({ Authorization: defaultJwt })
//     //     .then((res) => {
//     //       expect(res.status).to.equal(200);
//     //       expect(res.body.id).to.equal(defaultUser.id);
//     //     });
//     // });
//     //
//     // it("Should not return the resource if the current user is unauthenticated.", () => {
//     //   return request(app)
//     //     .get(`/v1/user/account/${adminUser.id}`)
//     //     .set({ Authorization: "random_token" })
//     //     .then((res) => {
//     //       expect(res.status).to.equal(401);
//     //       expect(res.text).to.equal("Failed to authenticate credentials.");
//     //     });
//     // });
//     //
//     // it("Should return the resource if the authed user is admin.", () => {
//     //   return request(app)
//     //     .get(`/v1/user/account/${defaultUser.id}`)
//     //     .set({ Authorization: adminJwt })
//     //     .then((res) => {
//     //       expect(res.status).to.equal(200);
//     //       expect(res.body.id).to.equal(defaultUser.id);
//     //     });
//     // });
//   });
//
//   describe("GET /v1/user/list", () => {
//     // it("Should fail to return a list of users if user is not logged in.", () => {
//     //   return request(app)
//     //     .get(`/v1/user/list`)
//     //     .then((res) => {
//     //       expect(res.status).to.equal(401);
//     //       expect(res.text).to.equal("Failed to authenticate credentials.");
//     //     });
//     // });
//     //
//     // it("Should fail to return a list of users if user has invalid token.", () => {
//     //   return request(app)
//     //     .get(`/v1/user/list`)
//     //     .set({ Authorization: "invalid_token" })
//     //     .then((res) => {
//     //       expect(res.status).to.equal(401);
//     //       expect(res.text).to.equal("Failed to authenticate credentials.");
//     //     });
//     // });
//     //
//     // it("Should fail to return a list of users if user is not admin.", () => {
//     //   return request(app)
//     //     .get(`/v1/user/list`)
//     //     .set({ Authorization: defaultJwt })
//     //     .then((res) => {
//     //       expect(res.status).to.equal(403);
//     //       expect(res.text).to.equal(
//     //         "You do not have permission to use this resource."
//     //       );
//     //     });
//     // });
//     //
//     // it("Should return a list of users if user is admin.", () => {
//     //   return request(app)
//     //     .get(`/v1/user/list`)
//     //     .set({ Authorization: adminJwt })
//     //     .then((res) => {
//     //       expect(res.status).to.equal(200);
//     //       expect(res.body.length).to.equal(2);
//     //       res.body.forEach((_) => expect(_).to.haveOwnProperty("id"));
//     //     });
//     // });
//   });
//
//   //   describe("POST /v1/user/account", () => {
//   //     it("Should be able to create user if user is admin.", (done) => {
//   //       return request(app)
//   //         .post(`/v1/user/account`)
//   //         .set({ Authorization: adminJwt })
//   //         .send({ id: "newUser", password: "newPassword", admin: true })
//   //         .on("done", (res) => {
//   //           console.log(res);
//   //         });
//   //     });
//   //   });
//   //
//   //   describe("DELETE /v1/user/account", () => {
//   //     it("Should be able to delete user if user is admin.", async () => {
//   //       await request(app)
//   //         .get(`/v1/user/list`)
//   //         .set({ Authorization: adminJwt })
//   //         .on("done", (res) => {
//   //           expect(res.status).to.equal(200);
//   //           expect(res.body.length).to.equal(2);
//   //           res.body.forEach((_) => expect(_).to.haveOwnProperty("id"));
//   //         });
//   //     });
//   // });
//
//   afterEach((done) => {
//     deleteAllUsers();
//     done();
//   });
// });
