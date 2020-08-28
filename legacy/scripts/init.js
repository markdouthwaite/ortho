const mongoose = require("mongoose");
const { createUser, getUser } = require("../src/user");

console.log("here");

users = [{ id: "" }];

mongoose.set("useCreateIndex", true);
mongoose
  .connect("mongodb://localhost:27017/auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "users",
  })
  .then((conn) => {
    console.log(createUser("mark@douthwaite.io", "password", true));
  });
// .then((_) => {
//   createUser("mark@douthwaite.io", "password", true)
//     .then((user) => {
//       mongoose.disconnect();
//     })
//     .catch(console.error)
//     .then(mongoose.disconnect());
//   console.log("there");
// });
