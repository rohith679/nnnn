const UtilController = require("./../services/UtilController");
const AWS = require("aws-sdk");
const region = "ap-south-1";
AWS.config.update(region);
let myBucket = "genex-project";
const signedUrlExpireSeconds = 60 * 6;
const accessKeyId = "AKIA4M4B7CZ65PNXYBHI";
const secretAccessKey = "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";
const { v4: uuidv4 } = require("uuid");
const connection = require("../../../config/connection");

const s3 = new AWS.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

module.exports = {
  uploadFile: async (req, res, next) => {
    try {
      let fileType = req.body.fileType ?? ".png";
      const file = uuidv4() + `.${fileType}`;
      let bucketName = req.body.bucketName || connection.aws.prodbucket;
      let params = {
        Bucket: myBucket + `/${bucketName}`,
        Key: file,
        Expires: signedUrlExpireSeconds,
      };

      const uploadURL = s3.getSignedUrl("putObject", params);
      let result = uploadURL ?? "";

      UtilController.sendSuccess(req, res, next, {
        result,
      });
    } catch (err) {
      console.error("error in upload--", err.name);
      UtilController.sendError(req, res, next, err);
    }
  },
};
