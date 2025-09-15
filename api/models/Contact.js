// models/Contact.js
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String },
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
  { collection: "contacts" }
);

module.exports = mongoose.model("Contact", contactSchema);
