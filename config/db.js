const mongoose = require("mongoose");

let dbConn = null;

const connectDB = async (dbUrl) => {
  try {
    if (dbConn) {
      console.log("conn found");
      return dbConn;
    }
    mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true, 
      maxPoolSize: 5,
    });

    dbConn = mongoose.connection;
    console.log("connection established");
    // console.log("\x1b[32mconn created\x1b[0m");

    return dbConn;
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
