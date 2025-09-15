const Contact = require("../../models/Contact");
const transporter = require("../services/mailer"); // adjust path
const UtilController = require("../services/UtilController");

module.exports = {
  createContact: async (req, res, next) => {
    try {
      const { name, email, phone, message, brochure } = req.body;
      console.log("req.body: ", req.body);

      if (!name || !email) {
        return res.status(400).json({ message: "Name & Email are required" });
      }

      if (brochure === true) {
        await transporter.sendMail({
          from: `"Download Brochure Form" ${name}`,
          to: "info@poojakitchenware.com",
          subject: `📩 New Contact from ${name}`,
          html: `
          <h3>New Download Brochure Submission</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone || "N/A"}</p>
          <p><b>Message:</b> ${message || "N/A"}</p>
        `,
        });
      } else {
        await transporter.sendMail({
          from: `"Contact Form" ${name}`,
          to: "info@poojakitchenware.com",
          subject: `📩 New Contact from ${name}`,
          html: `
          <h3>New Contact Submission</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone || "N/A"}</p>
          <p><b>Message:</b> ${message || "N/A"}</p>
        `,
        });
      }
      // const newContact = new Contact({ name, email, phone, message });
      // await newContact.save();

      // ✅ Send email notification

      UtilController.sendSuccess(req, res, next, {
        message: "Contact created successfully",
      });
    } catch (err) {
      console.error("Error creating contact:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // READ All Contacts
  getContacts: async (req, res, next) => {
    try {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      UtilController.sendSuccess(req, res, next, { contacts });
    } catch (err) {
      console.error("Error fetching contacts:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // READ Single Contact
  getContactById: async (req, res) => {
    try {
      const contact = await Contact.findById(req.params.id);
      if (!contact)
        return res.status(404).json({ message: "Contact not found" });
      res.json(contact);
    } catch (err) {
      console.error("Error fetching contact:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // DELETE Contact
  deleteContact: async (req, res, next) => {
    try {
      const contact = await Contact.findByIdAndDelete(req.query.id);
      if (!contact)
        return res.status(404).json({ message: "Contact not found" });
      UtilController.sendSuccess(req, res, next, {
        message: "Contact deleted successfully",
        contact,
      });
    } catch (err) {
      console.error("Error deleting contact:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  updateContact: async (req, res, next) => {
    try {
      const updatedObj = req.body;
      const { id } = req.body;
      const updatedContact = await Contact.findOneAndUpdate(
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
};
