const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const jwt = require("express-jwt");

const { UserRouter } = require("./routes/user");
const { AuthRouter } = require("./routes/auth");

const SECRET = process.env.SECRET;

const DB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

const SECRET_ALGO = "HS256";
const TOKEN_EXPIRY = 3600;

mongoose.set("useCreateIndex", true);
mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: DB_NAME,
  })
  .then(console.log("Connected to MongoDB."))
  .catch((err) => {
    console.log("MongoDB connection error. Aborting.", err);
    process.exit(1);
  });

const app = express();

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  jwt({ secret: SECRET, algorithms: [SECRET_ALGO] }).unless({
    path: ["/v1/auth"],
  })
);

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Failed to authenticate credentials.");
  } else {
    next();
  }
});

app.use(
  "/v1/auth",
  AuthRouter(SECRET, { expiresIn: TOKEN_EXPIRY, algorithm: SECRET_ALGO })
);

app.use("/v1/user", UserRouter);

app.use("*", function (req, res) {
  res.status(404).send(`Cannot ${req.method} ${req.baseUrl}`);
});

module.exports = { app, SECRET, SECRET_ALGO, TOKEN_EXPIRY };
