const { returnCode } = require("../../../config/responseCode");
const Review = require("../../models/Review");
const UtilController = require("../services/UtilController");

module.exports = {
  createReview: async (req, res, next) => {
    try {
      const { name, email, organization, rating, category, review, agree } =
        req.body;
      console.log("req.body: ", req.body);
      let photo = null;

      //   if (req.file) {
      //     photo = req.file.filename; // or full path / cloud URL
      //   }

      // if (!agree) {
      //   UtilController.sendError(req, res, next, {
      //     message: "You must agree to publish review.",
      //     responseCode: returnCode.incompleteBody,
      //   });
      // }

      const newReview = new Review({
        name,
        email,
        organization,
        rating,
        category,
        review,
        // photo,
        agree,
      });

      await newReview.save();

      UtilController.sendSuccess(req, res, next, {
        message: "Review created successfully",
        review: newReview,
      });
    } catch (error) {
      console.error("Error creating review:", error);
      UtilController.sendError(req, res, next, {
        message: "Error creating review",
        responseCode: returnCode.serverError,
      });
    }
  },

  // Get all reviews
  getReviews: async (req, res, next) => {
    try {
      const reviews = await Review.find().sort({ createdAt: -1 });
      UtilController.sendSuccess(req, res, next, { reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      UtilController.sendError(req, res, next, {
        message: "Error fetching reviews",
        responseCode: returnCode.serverError,
      });
    }
  },
  getReviewsAgree: async (req, res, next) => {
    try {
      const reviews = await Review.find({ agree: true }).sort({
        createdAt: -1,
      });
      UtilController.sendSuccess(req, res, next, { reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      UtilController.sendError(req, res, next, {
        message: "Error fetching reviews",
        responseCode: returnCode.serverError,
      });
    }
  },

  // Get single review by ID
  getReviewById: async (req, res, next) => {
    try {
      const review = await Review.findById(req.query.id);
      if (!review)
        UtilController.sendError(req, res, next, {
          message: "Review not found",
          responseCode: returnCode.noData,
        });
      UtilController.sendSuccess(req, res, next, { review });
    } catch (error) {
      console.error("Error fetching review:", error);
      UtilController.sendError(req, res, next, {
        message: "Error fetching review",
        responseCode: returnCode.serverError,
      });
    }
  },

  // Delete review
  deleteReview: async (req, res, next) => {
    try {
      const deletedReview = await Review.findByIdAndDelete(req.query.id);
      if (!deletedReview)
        UtilController.sendError(req, res, next, {
          message: "Review not found",
          responseCode: returnCode.noData,
        });
      UtilController.sendSuccess(req, res, next, {
        message: "Review deleted successfully",
        review: deletedReview,
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      UtilController.sendError(req, res, next, {
        message: "Error deleting review",
        responseCode: returnCode.serverError,
      });
    }
  },

  // Update review
  updateReview: async (req, res, next) => {
    try {
      const updatedObj = req.body;
      const { id } = req.body;
      const updatedReview = await Review.findOneAndUpdate(
        { _id: id },
        updatedObj
      );
      UtilController.sendSuccess(req, res, next, {
        message: "Review updated successfully",
        review: updatedReview,
      });
    } catch (err) {
      console.error("Error updating review:", err);
      UtilController.sendError(req, res, next, {
        message: "Error updating review",
        responseCode: returnCode.serverError,
      });
    }
  },
};
