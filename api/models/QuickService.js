const mongoose = require("mongoose");

const QuickServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  serviceType: { type: String, required: true },
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
});

module.exports = mongoose.model("QuickService", QuickServiceSchema);
