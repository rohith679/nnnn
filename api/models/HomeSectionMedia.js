const mongoose = require("mongoose");

const HomeMediaSchema = new mongoose.Schema({
  sectionName: {
    type: String,
    enum: [
      "Top Banner",
      "Motors & Pumps",
      "Wires & Accessories",
      "Switches & Accessories",
      "Lighting Solutions",
      "Faucets & Sanitarywares",
      "Plumbing Products",
      "Appliances",
      "Electrical Services",
      "Plumbing Services",
      "About Us",
      "Contact Us",
    ],
  },

  type: {
    type: String,
    enum: ["image", "video"],
  },
  banner: {
    type: Boolean,
    default: false,
  },

  url: { type: String }, // media file URL

  createdAt: { type: Number, default: Math.floor(Date.now() / 1000) },
  updatedAt: { type: Number, default: Math.floor(Date.now() / 1000) },
});

module.exports = mongoose.model("HomeMedia", HomeMediaSchema);
