const User = require("./../models/User");
const UtilController = require("./../services/UtilController");

const passwordSecretKey = "Admin@23";
const jwt = require("jsonwebtoken");

module.exports = {
  verifyToken: (token) => {
    try {
      var decoded = jwt.verify(token, passwordSecretKey);
      console.log(decoded.userType); // 'admin', 'employee', etc.

      return decoded;
    } catch (err) {
      console.error("in verify token--", err.name, err.message);
      return err;
    }
  },
  // signWithOtp: (uid) => {
  //   try {
  //     var token = jwt.sign({ uid }, passwordSecretKey, {
  //       expiresIn: 600, //sec
  //     });
  //     return token;
  //   } catch (err) {
  //     console.error("error in sign token----", err);
  //     return err;
  //   }
  // },
  createToken: (uid, userType, expiresIn = 36000) => {
    try {
      var token = jwt.sign({ uid, userType }, passwordSecretKey, {
        expiresIn: expiresIn, //sec
      });
      return token;
    } catch (error) {
      console.error("error in create token----", error);
      return error;
    }
  },
  addUserToReq(req, userObj) {
    try {
      req.user = { ...req?.user, ...userObj };
      return req;
    } catch (error) {
      console.error("error adduserTkn-", error);
      return error;
    }
  },
};
