let request = require("request");
var fs = require("fs");
var path = require("path");
let mongoose = require("mongoose");
const connection = require("./../../../config/connection");
const AWS = require("aws-sdk");
const NotificationTemplate = require("./../../models/NotificationTemplate");

const nodemailer = require("nodemailer"); // sending email from smtp connection
const UtilController = require("./UtilController");

AWS.config.update({
  secretAccessKey: connection.aws.secretAccessKey,
  accessKeyId: connection.aws.accessKeyId,
  region: "ap-south-1",
});
module.exports = {
  sendEmail: async function (data) {
    // Create sendEmail params
    var params = {
      Destination: {
        /* required */
        CcAddresses: [
          "mallikarjuna@geeksynergy.com",
          /* more items */
        ],
        ToAddresses: [
          "mallikarjuna023@gmail.com",
          /* more items */
        ],
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: "UTF-8",
            Data: data,
          },
          // Text: {
          //   Charset: "UTF-8",
          //   Data: "The easiest way to play videos in HTML, is to use YouTube."
          // }
        },
        Subject: {
          Charset: "UTF-8",
          Data: "AWS Test emai",
        },
      },
      Source: "Hoblist<notification@hoblist.com>",
      /* required */
      ReplyToAddresses: [
        "notification@hoblist.com",
        /* more items */
      ],
    };

    // Create the promise and SES service object
    var sendPromise = new AWS.SES({
      apiVersion: "2010-12-01",
    })
      .sendEmail(params)
      .promise();

    // Handle promise's fulfilled/rejected states
    sendPromise
      .then(function (data) {
        res.send(JSON.stringify(data));
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
  },
  sendUserMail: async function (template, emailData) {
    try {
      fs.readFile(template, "utf8", function (err, data) {
        if (err) {
          console.error(err);
        } else {
          for (keys in emailData.data) {
            let tempRep = new RegExp("<%" + keys + "%>", "g");
            data = data.replace(tempRep, emailData.data[keys]);
          }
          var params = {
            Destination: {
              ToAddresses: [emailData.toAddresses],
            },
            Message: {
              Body: {
                Html: {
                  Charset: "UTF-8",
                  Data: data,
                },
              },
              Subject: {
                Charset: "UTF-8",
                Data: emailData.emailSubject,
              },
            },
            //Source: 'Hoblist<notification@hoblist.com>',
            Source: "Pimarq<noreply@pimarq.com>",
            ReplyToAddresses: [
              "enquiry@pimarq.com",
              //'notification@hoblist.com',
            ],
          };

          var sendPromise = new AWS.SES({
            apiVersion: "2010-12-01",
          })
            .sendEmail(params)
            .promise();
          sendPromise
            .then(function (data) {
              console.log("email send response: " + emailData.toAddresses);
            })
            .catch(function (err) {
              console.error(err, err.stack);
            });
        }
      });
    } catch (err) {
      console.log(err);
    }
  },
  sendUserCustomMail: async function (data, emailData) {
    try {
      for (keys in emailData.data) {
        let tempRep = new RegExp("<%" + keys + "%>", "g");
        data = data.replace(tempRep, emailData.data[keys]);
      }
      var params = {
        Destination: {
          ToAddresses: [emailData.toAddresses],
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: data,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: emailData.emailSubject,
          },
        },
        Source: "Pimarq<noreply@pimarq.com>",
        ReplyToAddresses: ["enquiry@pimarq.com"],
      };

      var sendPromise = new AWS.SES({
        apiVersion: "2010-12-01",
      })
        .sendEmail(params)
        .promise();
      sendPromise
        .then(function (data) {
          console.log("email send response: " + emailData.toAddresses);
        })
        .catch(function (err) {
          console.error(err, err.stack);
        });
    } catch (err) {
      console.log(err);
    }
  },
  // this is dyanamic and getting credentials from areas specific. can be configure for any smtp email server
  sendCustomMail: async function (emailData) {
    try {
      // let areaResult = await Area.findById(emailData.areaId).select('emailGateway');
      let gateway = connection;
      if (!(typeof gateway === "undefined" || gateway === null)) {
        switch (gateway.emailGateway.provider) {
          case "aws":
            module.exports.sendEmailByAWS(gateway.emailGateway, emailData);
            break;
          case "smtp":
            module.exports.sendEmailBySMTP(gateway.emailGateway, emailData);
            break;
          case "sendgrid":
            module.exports.sendEmailBySendGrid(gateway.emailGateway, emailData);
            break;
          default:
        }
        // test nodemailer, end here
      }
    } catch (err) {
      console.log(err);
    }
  },
  sendEmailBySMTP: async (credentials, emailData) => {
    try {
      // test nodemailer, start here
      let transporter = nodemailer.createTransport({
        host: credentials.server,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMPT_MAIL, // smtp userName
          pass: process.env.SMPT_PASS, // smtp user password
        },
      });
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: credentials.senderEmail, // sender address
        replyTo: credentials.replyToEmail,
        to: emailData.toAddresses, // list of receivers
        subject: emailData.subject, // Subject line
        html: emailData.content, // html body
      });
      console.log(
        "smtp email message sent to : %s " + emailData.toAddresses,
        info.messageId
      );
    } catch (err) {
      console.error(err);
    }
  },
  //replace dynamic variable
  replaceTemplateDynamicVariable: async (notification, content) => {
    let data = "";
    let templateSubject = "";
    let templateTitle = "";
    try {
      let template = await NotificationTemplate.findOne({
        title: notification?.notificationData?.notification?.title,
        active: true,
        notificationType:
          notification?.notificationData?.notification?.notificationType,
      });

      if (!UtilController.isEmpty(template)) {
        data = template.content;
        templateTitle = template.title;

        if (notification.notificationType === "email") {
          // Check if the template content is encoded in base64
          let bufferObj = Buffer.from(template.content, "base64");
          let decodedContent = bufferObj.toString("utf8");
          if (
            decodedContent.trim().startsWith("<!DOCTYPE html>") ||
            decodedContent.includes("<html>")
          ) {
            data = decodedContent;
          } else {
            data = decodedContent;
          }

          templateSubject = template.subject;
        } else if (notification.notificationType === "notice") {
          templateSubject = template.subject;
        } else {
          templateSubject = template.subject;
        }

        let keys,
          values = "";
        let tempRep;
        for (let i = 0; i < template.dynamicVariable.length; i++) {
          keys = template.dynamicVariable[i].label;
          tempRep = new RegExp("<%" + keys + "%>", "g");
          values = notification?.notificationData?.data[keys];
          if (
            values !== undefined &&
            values.length > template.dynamicVariable[i].contentLength
          ) {
            values = values.substr(
              0,
              template.dynamicVariable[i].contentLength
            );
          }
          data = data.replace(tempRep, values);
          templateSubject = templateSubject.replace(tempRep, values);
          templateTitle = templateTitle.replace(tempRep, values);
        }
      }
    } catch (err) {
      console.error(err);
    }

    // Return the processed content, subject, and title
    let returnData = {
      content: data,
      subject: templateSubject,
      title: templateTitle,
    };
    return returnData;
  },

  sendEmailByAWS: async (credentials, emailData) => {
    try {
      AWS.config.update({
        secretAccessKey: credentials.secretAccessKey,
        accessKeyId: credentials.accessKeyId,
        region: credentials.region,
      });
      var params = {
        Destination: {
          ToAddresses: [emailData.toAddresses],
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: `
                <div>
                  ${emailData.content} <!-- Email body content here -->
                  <br /><br />
                  <!-- Signature starts here -->
                  <!-- <div style="border-top: 1px solid #ccc; padding-top: 10px;">
                    <p>Best regards,</p>
                    <p><img src="https://clippetuploads.s3.ap-south-1.amazonaws.com/maiSignature.jpg" alt="Your Company Logo" style="width:150px;" /></p>
                    <p>
                      <a href="https://clippet.ai" target="_blank" style="color:#3366cc;">Clippet.ai</a>
                      &nbsp;&nbsp;|&nbsp;&nbsp;
                      <a href="https://www.instagram.com/clippet.design/" target="_blank" style="text-decoration:none;">
                        <img src="https://clippetuploads.s3.ap-south-1.amazonaws.com/1.png" alt="Instagram" style="width:20px;height:20px;vertical-align:middle;" />
                      </a>
                      &nbsp;&nbsp;
                      <a href="https://www.facebook.com/clippet.design/" target="_blank" style="text-decoration:none;">
                        <img src="https://clippetuploads.s3.ap-south-1.amazonaws.com/4.png" alt="Facebook" style="width:20px;height:20px;vertical-align:middle;" />
                      </a>
                      &nbsp;&nbsp;
                      <a href="https://www.youtube.com/@clippet.design" target="_blank" style="text-decoration:none;">
                        <img src="https://clippetuploads.s3.ap-south-1.amazonaws.com/3.png" alt="YouTube" style="width:20px;height:20px;vertical-align:middle;" />
                      </a>
                      &nbsp;&nbsp;
                      <a href="https://www.linkedin.com/company/clippet" target="_blank" style="text-decoration:none;">
                        <img src="https://clippetuploads.s3.ap-south-1.amazonaws.com/2.png" alt="LinkedIn" style="width:20px;height:20px;vertical-align:middle;" />
                      </a>
                    </p>
                  </div> -->
                </div>
              `,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: emailData.subject,
          },
        },
        Source: `RentDoor <${credentials.senderEmail}>`,
        ReplyToAddresses: [credentials.replyToEmail],
      };

      var sendPromise = new AWS.SES({
        apiVersion: "2010-12-01",
      })
        .sendEmail(params)
        .promise();

      sendPromise
        .then(function (data) {
          console.log("email send response: " + emailData.toAddresses);
        })
        .catch(function (err) {
          console.log("an error occurred");
          console.error(err, err.stack);
        });
    } catch (err) {
      console.error(err);
    }
  },
  sendEmailBySendGrid: async (credentials, emailData) => {
    try {
    } catch (err) {
      console.error(err);
    }
  },
  sendCustomMails: async (notificationData) => {
    try {
      let notifyTemplate = {};

      notifyTemplate = await module.exports.replaceTemplateDynamicVariable(
        notificationData
      );
      notifyTemplate["body"] = notifyTemplate.content;
      // console.log(
      //   "connection.emailGateway.replyToEmail;",
      //   connection.emailGateway.replyToEmail
      // );

      if (!UtilController.isEmpty(notificationData)) {
        notifyTemplate["replyToEmail"] = connection.emailGateway.replyToEmail;
        notifyTemplate["toAddresses"] =
          notificationData?.notificationData?.email ?? notificationData?.email;
        await module.exports.sendEmailByAWS(
          connection.emailGateway,
          notifyTemplate
        );
        console.log(notifyTemplate, "from notify template");
      }
    } catch (err) {
      console.error(err);
    }
  },
};
