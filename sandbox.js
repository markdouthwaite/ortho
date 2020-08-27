"use strict";

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./models/users");

class AuthError extends Error {}

const DIGEST = "SHA512";
const KEY_LENGTH = 256;
const SALT_LENGTH = 32;
const ITERATIONS = 10000;

function verifyPassword(user, password) {
  const hash = crypto
    .pbkdf2Sync(password, user.salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");
  return user.hash === hash;
}

function encryptPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");
  return { salt, hash };
}

function getClaim(user) {
  return {
    id: user.id,
    admin: user.admin,
  };
}

async function makeUser(query, callback) {
  const user = {
    id: query.id,
  };
  const encrypted = encryptPassword("myPassword");
  return callback(null, { ...user, ...encrypted });
}

async function getUser(id, callback) {
  // return User.findOne({ id: id }, callback);
  return makeUser({ id: id }, callback);
}

async function authUser(creds, secret, options, callback) {
  if (!creds.id || !creds.password) {
    return callback(
      new AuthError("Invalid credentials: no credentials provided.")
    );
  }

  if (!secret) return callback(new AuthError("No secret provided."));

  if (typeof options === "function" && !callback) {
    callback = options;
  }

  return getUser(creds.id, (err, user) => {
    if (err != null) {
      return callback(new AuthError("Failed to acquire user: " + err.message));
    }
    if (!user)
      return callback(new AuthError("Invalid credentials: unknown user."));
    if (!verifyPassword(user, creds.password)) {
      return callback(
        new AuthError("Invalid credentials: incorrect password..")
      );
    } else {
      const token = jwt.sign(getClaim(user), secret, options);

      return callback(null, `Bearer ${token}`);
    }
  });
}

const cb = (e, u) => u;

const key = authUser(
  { id: "0", password: "myPassword" },

  "secret",
  { expiresIn: 3600, algorithm: "HS256" },
  cb
).then((_) => console.log(_));
