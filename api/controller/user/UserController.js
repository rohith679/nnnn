const User = require("../../models/User");
var CryptoJS = require("crypto-js");
const UtilController = require("../services/UtilController");
const { returnCode } = require("../../../config/responseCode");
const { createToken } = require("../services/TokenController");
const passwordKey = "Json222";
module.exports = {
  createUser: async (req, res, next) => {
    try {
      const { name, email, phone, password, userType } = req.body;
      // check existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        UtilController.sendSuccess(req, res, next, {
          message: "User already exists",
          responseCode: returnCode.folderAlreadyExists,
        });
      }

      // encrypt password
      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        passwordKey
      ).toString();
      const user = new User({
        name,
        email,
        phone,
        password: encryptedPassword,
        userType,
      });

      await user.save();

      UtilController.sendSuccess(req, res, next, {
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      UtilController.sendError(req, res, next, {
        message: "Error creating user",
        responseCode: returnCode.serverError,
      });
    }
  },

  loginUser: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return UtilController.sendError(req, res, next, {
          message: "Invalid email or password",
          responseCode: returnCode.unauthorized,
        });
      }

      // decrypt password
      const decryptedPassword = CryptoJS.AES.decrypt(
        user.password,
        passwordKey
      ).toString(CryptoJS.enc.Utf8);

      if (decryptedPassword !== password) {
        return UtilController.sendError(req, res, next, {
          message: "Invalid email or password",
          responseCode: returnCode.unauthorized,
        });
      }

      // generate JWT token
      const token = createToken(user._id, user.role);

      UtilController.sendSuccess(req, res, next, {
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
        },
      });
    } catch (error) {
      console.error("Error logging in:", error);
      UtilController.sendError(req, res, next, {
        message: "Error logging in",
        responseCode: returnCode.serverError,
      });
    }
  },

  uploadFiles: async (req, res, next) => {
    console.log("uploadFiles - try");
    try {
      UtilController.uploadFiles(req, res, next);
    } catch (err) {
      console.log("uploadFiles -catch");
      console.log(err);
      UtilController.sendError(req, res, next, err);
    }
  },
};
