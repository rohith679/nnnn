let request = require("request");
let mongoose = require("mongoose");
var CryptoJS = require("crypto-js");
const responseCode = require("./../../../config/responseCode").returnCode;
const User = require("./../../models/User");
const AwsController = require("./../services/AwsController");
const awsConfig = require("./../../../config/connection");
const { returnCode } = require("../../../config/responseCode");

var link = awsConfig.aws.link;
const axios = require("axios");
module.exports = {
  sendSuccess: async (req, res, next, data) => {
    try {
      if (module.exports.isEmpty(data.responseCode)) {
        data["responseCode"] = responseCode.validSession;
      }

      if (!res.headersSent) {
        res.status(200).send({
          message: "success",
          code: responseCode.success,
          data: data,
        });
      } else {
        console.warn("sendSuccess: Response already sent.");
      }
    } catch (err) {
      console.error("Error in sendSuccess:", err);
    }
  },

  sendError: async (req, res, next, err) => {
    try {
      if (!res.headersSent) {
        res.status(500).send({
          message: "failure",
          code: responseCode.errror,
          data: err,
        });
      } else {
        console.warn("sendError: Response already sent.");
      }
    } catch (e) {
      console.error("Error in sendError:", e);
    }
  },

  decryptData: (passwordHash, secretKey) => {
    try {
      let bytes = CryptoJS.AES.decrypt(passwordHash, secretKey);
      let decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      return null;
    }
  },
  unitCapacityMapping: {
    "1 Sharing": 1,
    "2 Sharing": 2,
    "3 Sharing": 3,
    "4 Sharing": 4,
    "5 Sharing": 5,
    "Single room": 1, ///  please give room first letter in small because frontend guys facing the issue while getting the data from DB
    "1RK": 1,
    "1BHK": 1,
    "2BHK": 1,
    "3BHK": 1,
    "4BHK": 1,
    "5BHK": 1,
  },
  sendError: async (req, res, next, err) => {
    try {
      if (!res.headersSent) {
        res.status(500).send({
          message: "failure",
          code: responseCode.errror,
          data: err,
        });
      } else {
        console.warn("sendError: Response already sent.");
      }
    } catch (e) {
      console.error("Error in sendError:", e);
    }
  },
  isEmpty: (data) => {
    let returnObj = false;
    if (
      typeof data === "undefined" ||
      data === null ||
      data === "" ||
      data === "" ||
      data.length === 0
    ) {
      returnObj = true;
    }
    return returnObj;
  },
  checkEmailStatus: (userObj) => {
    let userCode = responseCode.accountSuspended; // user account is suspended/ deactivated, needs to check with admin team
    try {
      if (!module.exports.isEmpty(userObj)) {
        if (!userObj.emailVerified) {
          userCode = responseCode.notVerifiedEmail; // success, email id is valid
        }
        if (userObj.active && userCode === responseCode.accountSuspended) {
          userCode = responseCode.validEmail; // success, email id is valid
        }
        if (userObj.passwordAttempt > 2) {
          userCode = responseCode.exceededpasswordAttempt; // success, email id is valid
        }
      } else {
        userCode = responseCode.emailNotFound; // email id is not there, wrong email address, records not found in DB
      }
    } catch (err) {
      console.error(err);
      userCode = responseCode.userException;
    } finally {
      return userCode;
    }
  },
  comparePassword: (passwordHash, userPassword, secretKey) => {
    let returnObj = responseCode.passwordMismatch;
    try {
      // Decrypt
      let bytes = CryptoJS.AES.decrypt(passwordHash, secretKey);
      let decryptedPwd = bytes.toString(CryptoJS.enc.Utf8);
      console.log("decryptedPwd", decryptedPwd);
      if (decryptedPwd === userPassword) {
        returnObj = responseCode.passwordMatched;
      }
    } catch (err) {
      console.error(err);
      returnObj = responseCode.userException;
    } finally {
      return returnObj;
    }
  },
  // getOTP: (userObj) => {
  //   console.log("getOTP");
  //   let otpVal = "13579"; // Static OTP for all users
  //   try {
  //     // You can add logging or debugging here if necessary
  //     console.log(
  //       `OTP generated for user: ${
  //         userObj?.mobileNo || userObj?.email || "unknown"
  //       }`
  //     );
  //   } catch (err) {
  //     console.error("Error generating OTP:", err);
  //   }
  //   console.log("Return OTP = " + otpVal);
  //   return otpVal;
  // },

  getOTP: (userObj) => {
    console.log("getOTP");
    let otpVal = 0;
    try {
      let numberArr = [6374001173];
      let isNumPresent = numberArr.includes(Number(userObj.mobileNo));
      if (isNumPresent) {
        otpVal = "135799";
      } else {
        otpVal = Math.floor(Math.random() * (999999 - 100000)) + 100000;
        // otpVal = "135799";
      }
      // otpVal = "135799"; // this is temparoty solution, once integrate sms gateway, need to remove this one
    } catch (err) {
      console.error(err);
    }
    console.log("return otp= " + otpVal);
    return otpVal;
  },
  uploadFiles: async function (req, res, next) {
    try {
      //var attachmentUrl = "";
      var attachmentUrlArray = [];
      var attachmentName;
      var code = 1;
      console.log(req.body);
      if (
        !(req.files === null || req.files === undefined) &&
        !(req.files.attachment === undefined)
      ) {
        // to get the bucket name based on input condition, starts Here
        var bucket = awsConfig.aws.bucket + "/" + req.body.bucketName;

        // ends here
        var attachmentObj = req.files.attachment;
        if (Array.isArray(attachmentObj)) {
          for (var i = 0; i < attachmentObj.length; i++) {
            attachmentName = Date.now() + "_" + attachmentObj[i].originalname;
            attachmentUrlArray.push(
              link.concat(bucket + "/" + encodeURIComponent(attachmentName))
            );
            await AwsController.upload2AWS(
              attachmentObj[i].path,
              bucket,
              attachmentName,
              attachmentObj[i].mimetype
            ); // this is async call, will not wait until to finish upload
          }
        } else {
          var attachmentPath = attachmentObj.path;
          attachmentName = Date.now() + "_" + attachmentObj.originalname;
          //  attachmentUrl = link.concat(bucket + '/' + attachmentName);
          attachmentUrlArray.push(
            link.concat(bucket + "/" + encodeURIComponent(attachmentName))
          );
          await AwsController.upload2AWS(
            attachmentPath,
            bucket,
            attachmentName,
            attachmentObj.mimetype
          ); // this is async call, will not wait until to finish upload
          if (
            !module.exports.isEmpty(req.body.isPrivate) &&
            req.body.isPrivate == "true"
          ) {
            data = {
              attachmentName,
              attachmentUrl: attachmentUrlArray[0],
            };
            module.exports.saveFile(req, res, next, data);
          } else {
            module.exports.sendSuccess(req, res, next, {
              attachmentUrl: attachmentUrlArray,
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
      module.exports.sendError(req, res, next, err);
    }
  },

  uploadFileWithReturn: async function (bucketParam, req, res, next) {
    try {
      //var attachmentUrl = "";
      var attachmentUrlArray = [];
      var code = 1;
      if (!(req.files === null || req.files === undefined)) {
        // to get the bucket name based on input condition, starts Here
        var bucket = bucketParam;
        // var bucket = awsConfig.aws.inventoryImageBucket;

        // ends here
        var attachmentObj = Object.values(req.files);
        if (Array.isArray(attachmentObj)) {
          for (var i = 0; i < attachmentObj.length; i++) {
            var attachmentName =
              Date.now() + "_" + attachmentObj[i].originalname;
            attachmentUrlArray.push(
              link.concat(bucket + "/" + encodeURIComponent(attachmentName))
            );
            await AwsController.upload2AWS(
              attachmentObj[i].path,
              bucket,
              attachmentName,
              attachmentObj[i].mimetype
            ); // this is async call, will not wait until to finish upload
          }
        } else {
          var attachmentPath = attachmentObj.path;
          var attachmentName = Date.now() + "_" + attachmentObj.originalname;
          //  attachmentUrl = link.concat(bucket + '/' + attachmentName);
          attachmentUrlArray.push(
            link.concat(bucket + "/" + encodeURIComponent(attachmentName))
          );
          await AwsController.upload2AWS(
            attachmentPath,
            bucket,
            attachmentName,
            attachmentObj.mimetype
          ); // this is async call, will not wait until to finish upload
        }
      }
      return attachmentUrlArray;
      // module.exports.sendSuccess(req, res, next, {
      //   attachmentUrl: attachmentUrlArray,
      // });
    } catch (err) {
      console.error(err);
      module.exports.sendError(req, res, next, err);
    }
  },
  uploadFiles: async function (req, res, next) {
    console.log("uploadFiles");
    try {
      //var attachmentUrl = "";
      var attachmentUrlArray = [];
      var attachmentName;
      var code = 1;
      console.log(req.body);
      if (
        !(req.files === null || req.files === undefined) &&
        !(req.files.attachment === undefined)
      ) {
        // to get the bucket name based on input condition, starts Here
        var bucket = awsConfig.aws.bucket + "/" + req.body.bucketName;

        // ends here
        var attachmentObj = req.files.attachment;
        if (Array.isArray(attachmentObj)) {
          for (var i = 0; i < attachmentObj.length; i++) {
            attachmentName = Date.now() + "_" + attachmentObj[i].originalname;
            attachmentUrlArray.push(
              link.concat(bucket + "/" + encodeURIComponent(attachmentName))
            );
            await AwsController.upload2AWS(
              attachmentObj[i].path,
              bucket,
              attachmentName,
              attachmentObj[i].mimetype
            ); // this is async call, will not wait until to finish upload
          }
        } else {
          var attachmentPath = attachmentObj.path;
          console.log("attachmentPath: ", attachmentPath);
          console.log("attachmentObj: ", attachmentObj);
          attachmentName = Date.now() + "_" + attachmentObj.originalname;
          //  attachmentUrl = link.concat(bucket + '/' + attachmentName);
          attachmentUrlArray.push(
            link.concat(bucket + "/" + encodeURIComponent(attachmentName))
          );
          await AwsController.upload2AWS(
            attachmentPath,
            bucket,
            attachmentName,
            attachmentObj.mimetype
          ); // this is async call, will not wait until to finish upload
          if (
            !module.exports.isEmpty(req.body.isPrivate) &&
            req.body.isPrivate == "true"
          ) {
            data = {
              attachmentName,
              attachmentUrl: attachmentUrlArray[0],
            };
            module.exports.saveFile(req, res, next, data);
          } else {
            module.exports.sendSuccess(req, res, next, {
              attachmentUrl: attachmentUrlArray,
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
      module.exports.sendError(req, res, next, err);
    }
  },
  uploadFileWithReturn: async function (bucketParam, req, res, next) {
    try {
      //var attachmentUrl = "";
      var attachmentUrlArray = [];
      var code = 1;
      if (!(req.files === null || req.files === undefined)) {
        // to get the bucket name based on input condition, starts Here
        var bucket = bucketParam;
        // var bucket = awsConfig.aws.inventoryImageBucket;

        // ends here
        var attachmentObj = Object.values(req.files);
        if (Array.isArray(attachmentObj)) {
          for (var i = 0; i < attachmentObj.length; i++) {
            var attachmentName =
              Date.now() + "_" + attachmentObj[i].originalname;
            attachmentUrlArray.push(
              link.concat(bucket + "/" + encodeURIComponent(attachmentName))
            );
            await AwsController.upload2AWS(
              attachmentObj[i].path,
              bucket,
              attachmentName,
              attachmentObj[i].mimetype
            ); // this is async call, will not wait until to finish upload
          }
        } else {
          var attachmentPath = attachmentObj.path;
          var attachmentName = Date.now() + "_" + attachmentObj.originalname;
          //  attachmentUrl = link.concat(bucket + '/' + attachmentName);
          attachmentUrlArray.push(
            link.concat(bucket + "/" + encodeURIComponent(attachmentName))
          );
          await AwsController.upload2AWS(
            attachmentPath,
            bucket,
            attachmentName,
            attachmentObj.mimetype
          ); // this is async call, will not wait until to finish upload
        }
      }
      return attachmentUrlArray;
      // module.exports.sendSuccess(req, res, next, {
      //   attachmentUrl: attachmentUrlArray,
      // });
    } catch (err) {
      console.error(err);
      module.exports.sendError(req, res, next, err);
    }
  },
  uploadFilesToStorage: async function (bucketParam, req, res, next) {
    try {
      //var attachmentUrl = "";
      var attachmentUrlArray = [];
      var code = 1;
      console.log(req.body);
      if (
        !(req.files === null || req.files === undefined) &&
        !(req.files.attachment === undefined)
      ) {
        // to get the bucket name based on input condition, starts Here
        var bucket = bucketParam;

        // ends here
        var attachmentObj = req.files.attachment;
        if (Array.isArray(attachmentObj)) {
          for (var i = 0; i < attachmentObj.length; i++) {
            var attachmentName =
              Date.now() + "_" + attachmentObj[i].originalname;
            attachmentUrlArray.push(
              link.concat(bucket + "/" + encodeURIComponent(attachmentName))
            );
            await AwsController.upload2AWS(
              attachmentObj[i].path,
              bucket,
              attachmentName,
              attachmentObj[i].mimetype
            ); // this is async call, will not wait until to finish upload
          }
        } else {
          var attachmentPath = attachmentObj.path;
          var attachmentName = Date.now() + "_" + attachmentObj.originalname;
          //  attachmentUrl = link.concat(bucket + '/' + attachmentName);
          attachmentUrlArray.push(
            link.concat(bucket + "/" + encodeURIComponent(attachmentName))
          );
          await AwsController.upload2AWS(
            attachmentPath,
            bucket,
            attachmentName,
            attachmentObj.mimetype
          ); // this is async call, will not wait until to finish upload
        }
      }
      return attachmentUrlArray;
      // module.exports.sendSuccess(req, res, next, {
      //   attachmentUrl: attachmentUrlArray
      // });
    } catch (err) {
      console.error(err);
      return new Array();
      // module.exports.sendError(req, res, next, err);
    }
  },
  pad: (num, size) => {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  },

  getHourAndMinuteFromMillisecond: (differenceMsec) => {
    var hour = Math.floor(differenceMsec / 1000 / 60 / 60);
    differenceMsec -= hour * 1000 * 60 * 60;
    var minute = Math.floor(differenceMsec / 1000 / 60);
    differenceMsec -= minute * 1000 * 60;
    var second = Math.floor(differenceMsec / 1000);
    differenceMsec -= second * 1000;
    return {
      hour,
      minute,
      second,
    };
  },

  hasCrossed10PMTo6AM: (dateTime1, dateTime2) => {
    const tenPM = new Date(dateTime1);
    tenPM.setHours(22, 0, 0, 0); // 10:00 PM

    const sixAM = new Date(dateTime1);
    sixAM.setHours(6, 0, 0, 0); // 6:00 AM (next day)

    if (dateTime1 > tenPM || dateTime2 > tenPM) {
      return true;
    } else if (dateTime1 < sixAM || dateTime2 < sixAM) {
      return true;
    } else {
      return false;
    }
  },

  getStartAndEndOfMoth: (currentDate) => {
    // Get the start of the month
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Get the end of the month
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    const endOfMonth = new Date(nextMonth - 1);

    return {
      startOfMonth: startOfMonth / 1000,
      endOfMonth: endOfMonth / 1000,
    };
  },

  getStartAndEndOfTheWeek: (currentDate) => {
    // Calculate the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = currentDate.getDay();

    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

    // Calculate the end of the week (Saturday)
    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(currentDate.getDate() + (6 - dayOfWeek));

    return { startOfWeek: startOfWeek / 1000, endOfWeek: endOfWeek / 1000 };
  },

  getStartAndEndOfDay: (currentDate) => {
    // Get the start of the day
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Get the end of the day
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay: startOfDay / 1000, endOfDay: endOfDay / 1000 };
  },

  getDistrictByPinCode: async (pinCOde) => {
    let url = "https://api.postalpincode.in/pincode/" + pinCOde;
    let options = {
      url: url,
      method: "GET",
      maxBodyLength: Infinity,
      headers: {
        "User-Agent": "Super Agent/0.0.1",
        "Content-Type": "application/json",
      },
    };
    let response = await axios.request(options);
    return response?.data[0]?.PostOffice[0] ?? null;
  },

  getLocation: async (req, res, next) => {
    var axios = require("axios");
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${awsConfig.googleApis.locationsApi}?input=${req.query.keyword}&key=${awsConfig.googleApis.apiKey}`,
      headers: {},
    };
    try {
      const data = await axios(config);
      let result = data?.data;
      module.exports.sendSuccess(req, res, next, {
        result,
      });
    } catch (err) {
      module.exports.sendError(req, res, next, err);
    }
  },

  getCoordinates: async (req, res, next) => {
    var axios = require("axios");
    var config = {
      method: "GET",
      maxBodyLength: Infinity,
      url: `${awsConfig.googleApis.coordinatesApi}?place_id=${req.query.place_id}&key=${awsConfig.googleApis.apiKey}`,
      headers: {},
    };
    try {
      const data = await axios(config);
      let result = data?.data;
      module.exports.sendSuccess(req, res, next, {
        result,
      });
    } catch (err) {
      module.exports.sendError(req, res, next, err);
    }
  },

  convertYearToMilliseconds: (year) => {
    let dateTimeNow = Math.floor(Date.now() / 1000);
    let milliseconds = 365.25 * year * 24 * 60 * 60;
    console.log("dateTimeNow - milliseconds", dateTimeNow - milliseconds);
    return dateTimeNow - milliseconds;
  },
  appVersion: async (req, res, next) => {
    try {
      let setting = await Setting.findOne({});
      module.exports.sendSuccess(req, res, next, {
        setting,
      });
    } catch (err) {
      module.exports.sendError(req, res, next, err);
    }
  },
  appVersionUpdate: async (req, res, next) => {
    try {
      let recordId = req.body.recordId;
      let queryObj = {
        _id: recordId,
      };
      let updateObj = req.body;
      const result = await Setting.findOneAndUpdate(queryObj, updateObj, {
        new: true,
      });

      module.exports.sendSuccess(req, res, next, {
        result,
      });
    } catch (err) {
      module.exports.sendError(req, res, next, err);
    }
  },

  parseTimeString: (timeString) => {
    const units = {
      min: 1,
      h: 60,
      d: 1440,
      w: 10080,
    };

    const regex = /(\d+)\s*(min|h|d|w)/gi;
    let totalMinutes = 0;

    let match;
    while ((match = regex.exec(timeString)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      totalMinutes += value * units[unit];
    }

    return totalMinutes;
  },

  tagGenerator: async (tagType) => {
    try {
      const tag = await Tag.findOneAndUpdate(
        { active: true, tagType },
        { $inc: { sequenceNo: 1 }, updatedAt: Math.floor(Date.now() / 1000) },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      // Ensure sequence number is at least 4 digits long (e.g., 0001)
      const sequenceNo = tag.sequenceNo.toString().padStart(4, "0");
      return { tagType: tag.tagType, sequenceNo };
    } catch (err) {
      return null;
    }
  },

  getCurrentTime: () => {
    return Math.floor(Date.now() / 1000);
  },
  convertToMongoose: (id) => {
    return mongoose.Types.ObjectId(id);
  },
  validateUser: (req, res, next) => {
    try {
      if (!req.body || (!req.body.userId && (!req.user || !req.user.userId))) {
        return module.exports.sendError(req, res, next, {
          responseCode: returnCode.unauthorized,
          message: "Unauthorized - User authentication required",
        });
      }

      next(); // Proceed if at least one userId is present
    } catch (error) {
      console.error("Error in validateUser:", error);
      return module.exports.sendError(req, res, next, {
        responseCode: returnCode.serverError,
        message: "Internal server error in validateUser",
      });
    }
  },

  checkUserId: (req, res, next) => {
    console.log("Checking user");
    if (!req.user || !req.user.userId) {
      console.log("User ID is missing in request object");
      return UtilController.sendSuccess(req, res, next, {
        responseCode: 401, // Unauthorized
        message: "Invalid session: User ID is missing",
      });
    }
    return true; // User ID exists
  },

  getPastEpochTime: (dateType) => {
    const currentDate = new Date();
    let pastDate;

    if (dateType === "week") {
      pastDate = new Date(currentDate);
      pastDate.setDate(currentDate.getDate() - 7);
    } else if (dateType === "month") {
      pastDate = new Date(currentDate);
      pastDate.setMonth(currentDate.getMonth() - 1);
    } else {
      throw new Error("Invalid dateType. Use 'lastWeek' or 'lastMonth'");
    }

    return Math.floor(pastDate.getTime() / 1000);
  },

  // utils/UtilController.js
  generateRandomPassword: () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },
  mergeAccessArrays: (existingAccess, newAccess) => {
    const map = new Map();
    for (const item of existingAccess) {
      map.set(item.label, { ...item, buttons: [...item.buttons] });
    }

    for (const item of newAccess) {
      if (map.has(item.label)) {
        const existing = map.get(item.label);
        const buttonMap = new Map();

        for (const btn of existing.buttons) {
          buttonMap.set(btn.label, { ...btn });
        }

        for (const btn of item.buttons) {
          buttonMap.set(btn.label, { ...btn });
        }

        map.set(item.label, {
          ...existing,
          enable: item.enable,
          isParent: item.isParent,
          parentId: item.parentId,
          buttons: Array.from(buttonMap.values()),
        });
      } else {
        map.set(item.label, { ...item, buttons: [...item.buttons] });
      }
    }

    return Array.from(map.values());
  },
};
