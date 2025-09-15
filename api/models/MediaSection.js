const mongoose = require("mongoose");

const BannerSectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
    enum: [
      "Motors & Pumps",
      "Wires & Accessories",
      "Switches & Accessories",
      "Lighting Solutions",
      "Faucets & Sanitarywares",
      "Plumbing Products",
      "Appliances",
      "Electrical Services",
      "Plumbing Services",
    ],
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  url: { type: String, required: true }, // media file URL
  title: { type: String }, // optional title text
  subtitle: { type: String }, // optional description
  createdAt: { type: Number, default: Math.floor(Date.now() / 1000) },
  updatedAt: { type: Number, default: Math.floor(Date.now() / 1000) },
});

module.exports = mongoose.model("BannerSection", BannerSectionSchema);
