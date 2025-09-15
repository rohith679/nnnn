const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
    },
    userType: {
      type: String,
      enum: ["customer", "admin", "staff"],
      default: "customer",
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // enforce security
    },
    active: {
      type: Boolean,
      default: true,
    },
    createAt: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000),
    },
    updateAt: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000),
    },
  },
  { collection: "users" }
);

module.exports = mongoose.model("User", userSchema);
