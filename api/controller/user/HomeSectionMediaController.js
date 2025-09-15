const HomeSectionMedia = require("../../models/HomeSectionMedia");
const UtilController = require("../services/UtilController");

module.exports = {
  createHomeSectionMedia: async (req, res, next) => {
    try {
      const createdObj = req.body;
      console.log("createdObj: ", createdObj);

      const newContact = await HomeSectionMedia.create(createdObj);
      console.log("newContact: ", newContact);

      UtilController.sendSuccess(req, res, next, {
        message: "Contact created successfully",
        contact: newContact,
      });
    } catch (err) {
      console.log("err: ", err);
      console.error("Error creating contact:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  updateHomeSectionMedia: async (req, res, next) => {
    try {
      const updatedObj = req.body;
      const { id } = req.body;
      const updatedContact = await HomeSectionMedia.findOneAndUpdate(
        { _id: id },
        updatedObj
      );
      UtilController.sendSuccess(req, res, next, {
        message: "Contact updated successfully",
        contact: updatedContact,
      });
    } catch (err) {
      console.error("Error updating contact:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  listHomeSectionMedia: async (req, res, next) => {
    try {
      const { banner } = req.query;
      const filter = {};

      if (banner !== undefined) {
        filter.banner = banner === "true"; // force string → boolean
      }

      const contacts = await HomeSectionMedia.find(filter).sort({
        createdAt: -1,
      });
      UtilController.sendSuccess(req, res, next, { contacts });
    } catch (err) {
      console.error("Error fetching contacts:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
  getById: async (req, res, next) => {
    try {
      let pipline = [
        {
          $match: {
            sectionName: req.body.section,
          },
        },
      ];
      const contact = await HomeSectionMedia.aggregate(pipline);
      if (!contact)
        return res.status(404).json({ message: "Contact not found" });
      UtilController.sendSuccess(req, res, next, {
        message: "Contact deleted successfully",
        contact,
      });
    } catch (err) {
      UtilController.sendError(req, res, next, err);
    }
  },
};
