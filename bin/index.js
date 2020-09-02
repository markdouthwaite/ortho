#!/usr/bin/env node

const mongoose = require("mongoose");
const yargs = require("yargs");

const { createUser, deleteUser } = require("../src/user");

console.log(process.env);

function execute(args, callback) {
  if (args.username) {
    mongoose.set("useCreateIndex", true);
    mongoose.connect(
      process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.DB_NAME,
      },
      callback
    );
  } else {
    console.log("You must provide a valid username and password.");
  }
}

const _ = yargs
  .command(
    "create",
    "create a new user",
    (yargs) => {
      yargs.options({
        username: {
          alias: "u",
          description: "<string> Username",
          required: true,
        },
        password: {
          alias: "p",
          description: "<string> Password",
          required: true,
        },
      });
    },
    (argv) => {
      execute(argv, () => {
        createUser(
          argv.username,
          argv.password,
          argv.admin || false,
          (err, user) => {
            if (err) {
              console.log(err);
              console.log("Failed to create user:", err.message);
            } else {
              console.log(`Created user ${user.username}`);
            }
            mongoose.disconnect();
          }
        );
      });
    }
  )
  .command(
    "delete",
    "delete a user",
    (yargs) => {
      yargs.options({
        username: {
          alias: "u",
          description: "<string> Username",
          required: true,
        },
      });
    },
    (argv) => {
      execute(argv, () => {
        deleteUser(argv.username, (err, _) => {
          if (err) {
            console.log("Failed to delete user:", err.message);
          } else {
            console.log(`Delete user ${argv.username}`);
          }
          mongoose.disconnect();
        });
      });
    }
  )
  .demandCommand()
  .help()
  .wrap(72).argv;
