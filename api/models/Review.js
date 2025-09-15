const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    organization: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5 },
    category: {
      type: String,
    },
    review: { type: String },
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
    photo: { type: String, default: null }, // store file path or URL
    agree: { type: Boolean },
  },
  {   collection: "reviews" }
);

module.exports = mongoose.model("Review", reviewSchema);
