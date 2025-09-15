const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();
// require("./cron/index");

const user = require("./routes/user");

const AuthorizationController = require("./api/controller/services/AuthorizationController");
const connection = require("./config/connection");
const connectDB = require("./config/db");

const app = express();

// ✅ Connect DB
connectDB(connection.dbUrl);

// ✅ Global Middleware (AFTER webhook)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://genex-devel.s3-website.ap-south-1.amazonaws.com",
      "http://beta.genex.com.s3-website.ap-south-1.amazonaws.com",
      "http://dev.genex.com.s3-website.ap-south-1.amazonaws.com",
      "http://beta.uat.genex.com.s3-website.ap-south-1.amazonaws.com",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(multer());
app.use(cookieParser());

// ✅ API routes (protected with middleware)
app.use(
  "/user",
  (req, res, next) => {
    AuthorizationController.checkRequestAuth(req, res, next);
  },
  user
);

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, "dist")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ✅ 404 Handler
app.use((req, res) => {
  return res.status(404).json({ error: "Not Found" });
});

module.exports = app;
