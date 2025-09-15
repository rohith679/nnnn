require("dotenv").config();
module.exports = {
  dbUrl: "mongodb+srv://digitner:M1j9zXHxegUVumut@sme.py0p26g.mongodb.net/SME",
  backup: {
    db: {
      path: "/home/ec2-user/_backup", // chage here based on os E://Clients/Myanmar/MyanPro/_backup
    },
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
    link: process.env.AWS_LINK,
  },

  emailGateway: {
    provider: process.env.EMAIL_PROVIDER,
    server: process.env.EMAIL_SERVER,
    userName: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    region: process.env.EMAIL_REGION,
    senderEmail: process.env.EMAIL_SENDER,
    replyToEmail: process.env.EMAIL_REPLYTO,
  },
};
