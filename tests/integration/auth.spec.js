const assert = require("assert");
const expect = require("chai").expect;
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");

const { app, SECRET } = require("../../app");
const { createUser, deleteUser } = require("../../src/user");

describe("Authentication", () => {
  const id = uuid();
  const password = uuid();

  before(() => {
    return createUser(id, password);
  });

  describe("POST /v1/auth", () => {
    it("Returns valid JWT when valid user ID and password provided.", () => {
      return request(app)
        .post("/v1/auth")
        .send({ id: id, password: password })
        .then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property("token");

          // check token format and content.
          const parts = res.body.token.split(" ");
          expect(parts[0]).equal("Bearer");
          jwt.verify(parts[1], SECRET, (err, _) => {
            assert(!err);
          });
          expect(jwt.decode(parts[1]).id).to.equal(id);
        });
    });

    it("Returns 401 error and correct message when invalid user ID provided.", () => {
      return request(app)
        .post("/v1/auth")
        .send({ id: "wrong_username", password: password })
        .then((res) => {
          expect(res.status).to.equal(401);
          expect(res.text).to.equal(
            "Invalid credentials: user id or password incorrect."
          );
        });
    });

    it("Returns 401 error and correct message when invalid password provided.", () => {
      return request(app)
        .post("/v1/auth")
        .send({ id: id, password: "wrong_password" })
        .then((res) => {
          expect(res.status).to.equal(401);
          expect(res.text).to.equal(
            "Invalid credentials: user id or password incorrect."
          );
        });
    });

    it("Returns 401 error and correct message when payload not sent.", () => {
      return request(app)
        .post("/v1/auth")
        .send({})
        .then((res) => {
          expect(res.status).to.equal(401);
          expect(res.text).to.equal(
            "Invalid credentials: missing credentials."
          );
        });
    });
  });

  after(() => {
    deleteUser(id);
  });
});

// POST api.ortho.io/v1/users {username: mark, password: this}

// All users resources
// POST /v1/auth
//  -> if user exists and password correct, should return valid JWT token, return 200.
//  -> if user exists and password incorrect, should return

// Admin only resources
// GET /v1/users/:id
//  -> if authenticated, and user exists, should return user data, with status 200.
//  -> if authenticated, and user does not exist, should return `No such user with id '${id}'.`, with status 404.
//  -> if unauthenticated, should return 'You do not have permission to access this resource', with status 403.
// GET /v1/users/list/:count
//  -> if authenticated, should return array of `count`, or all usernames, with status 200.
//  -> if unauthenticated, should return 'You do not have permission to access this resource', with status 403.
// POST /v1/users
//  -> if authenticated, should create new user if that user does not exist, with status 201.
// PUT /v1/users/:id
//  -> if authenticated, should update existing user if that user exists, with status 200.
// DELETE /v1/users/:id
//  -> if authenticated, should delete user if that user exists, with status 200.
