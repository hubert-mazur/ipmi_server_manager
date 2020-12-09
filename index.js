const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("morgan");
const fs = require('fs');

// Database connection
dotenv.config();

mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to DB");
  }
);

// Routes
const authRoute = require("./routes/auth");
const apiRoute = require("./routes/landing_page");
const userRoute = require("./routes/user_management");
const groupRoute = require("./routes/group");
const machineRoute = require("./routes/machine");

// Middlewares
app.use(express.json());
app.use(
  logger("common", {
    stream: fs.createWriteStream("./access.log", { flags: "a" }),
  })
);
// Routes middlewares

app.use("/api/login", authRoute);
app.use("/api/landing", apiRoute);
app.use("/api/user", userRoute);
app.use("/api/group", groupRoute);
app.use("/api/machine", machineRoute);

app.listen(3000, () => {
  console.log("Server started");
});
