var express = require("express");
var router = express.Router();
const UserController = require("../api/controller/user/UserController");
const ReviewController = require("../api/controller/user/ReviewController");
const QuickServiceController = require("../api/controller/user/QuickServiceController");
const ContactController = require("../api/controller/user/ContactController");
const HomeSectionMediaController = require("../api/controller/user/HomeSectionMediaController");
router.use(function (req, res, next) {
  //console.log('users route');
  next();
});

/* GET users related listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// general apis
router.route("/create/user").post(UserController.createUser);
router.route("/account/login").post(UserController.loginUser);

//review
router.route("/create/review").post(ReviewController.createReview);
router.route("/review/update").post(ReviewController.updateReview);
router.route("/review/all").get(ReviewController.getReviews);
router.route("/review/details").get(ReviewController.getReviewById);
router.route("/review/delete").delete(ReviewController.deleteReview);
router.route("/review/list/agree").get(ReviewController.getReviewsAgree);

router
  .route("/quick-service/create")
  .post(QuickServiceController.createRequest);
router.route("/quick-service/all").get(QuickServiceController.getRequests);
router
  .route("/quick-service/details")
  .get(QuickServiceController.getRequestById);
router
  .route("/quick-service/delete")
  .delete(QuickServiceController.deleteRequest);
router
  .route("/quick-service/update")
  .post(QuickServiceController.updateRequest);

router.route("/contact").post(ContactController.createContact);
router.route("/contact/all").get(ContactController.getContacts);
router.route("/contact/details").get(ContactController.getContactById);
router.route("/contact/update").post(ContactController.updateContact);
router.route("/contact/delete").delete(ContactController.deleteContact);

router
  .route("/create/home-section-media")
  .post(HomeSectionMediaController.createHomeSectionMedia);
router
  .route("/update/home-section-media")
  .post(HomeSectionMediaController.updateHomeSectionMedia);
router
  .route("/list/home-section-media")
  .get(HomeSectionMediaController.listHomeSectionMedia);
router.route("/upload/file").put(UserController.uploadFiles);

module.exports = router;
