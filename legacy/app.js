const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
const jwt = require("express-jwt");

const { UserRouter } = require("./routes/user");
const { AuthRouter } = require("./routes/auth");

dotenv.config();

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const PORT = process.env.SERVICE_PORT || 3000;
const SECRET = process.env.SERVICE_SECRET;
const SECRET_ALGO = "HS256";
const TOKEN_EXPIRY = 3600;

mongoose.set("useCreateIndex", true);
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: DB_NAME,
});

app = express();

// app.use(morgan("dev"));

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

app.listen(PORT, () => {
  console.log("Authentication service live on:", PORT);
});

module.exports = { app, SECRET, SECRET_ALGO, TOKEN_EXPIRY };
