#!/usr/bin/env node

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const yargs = require("yargs");

const { createUser } = require("../src/user");

dotenv.config();

var argv = yargs
  .usage("Welcome to The World of Ortho! Usage: $0 [options]")
  .help("help")
  .alias("help", "h")
  .version("version", "1.0.1")
  .alias("version", "V")
  .options({
    username: {
      alias: "u",
      description: "<string> Username",
      requiresArg: true,
      required: true,
    },
    password: {
      alias: "p",
      description: "<string> Password",
      requiresArg: true,
      required: true,
    },
    admin: {
      alias: "A",
      description:
        "<boolean> Indicate if the user should be created with admin rights.",
      required: false,
      type: "boolean",
    },
  }).argv;

if (argv.username && argv.password) {
  console.log(`Creating user ${argv.username}...`);
  mongoose.set("useCreateIndex", true);
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "users",
    })
    .then(
      createUser(
        argv.username,
        argv.password,
        argv.admin || false,
        (err, user) => {
          if (err) {
            console.log("Failed to create user:", err.message);
          } else {
            console.log(`Created user ${user.username}`);
          }
          mongoose.disconnect();
        }
      )
    );
} else {
  console.log("You must provide a valid username and password.");
}
