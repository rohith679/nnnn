const { returnCode } = require("../../../config/responseCode");
const QuickService = require("../../models/QuickService");
const UtilController = require("../services/UtilController");
const transporter = require("../services/mailer"); // adjust path

module.exports = {
  createRequest: async (req, res, next) => {
    try {
      const { name, phone, serviceType, message } = req.body;

      if (!name || !phone || !serviceType) {
        return UtilController.sendError(req, res, next, {
          message: "Full Name, Phone Number, and Service Type are required.",
          responseCode: returnCode.incompleteBody,
        });
      }

      const newRequest = new QuickService({
        name,
        phone,
        serviceType,
        message,
      });

      await newRequest.save();
      await transporter.sendMail({
        from: `"Quick Service" ${name}`,
        to: "srimuruganenterprisesvlr@gmail.com", // where you want to receive requests
        subject: `🛠️ New Service Request from ${name}`,
        html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="background: #4CAF50; color: #fff; padding: 10px 15px; border-radius: 5px;">
        New Service Request
      </h2>
      <p>You’ve received a new service request. Here are the details:</p>
      
      <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr style="background: #f9f9f9;">
          <td style="font-weight: bold; width: 150px;">👤 Name</td>
          <td>${name}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">📞 Phone</td>
          <td>${phone}</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="font-weight: bold;">🛠️ Service Type</td>
          <td>${serviceType}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">💬 Message</td>
          <td>${message || "N/A"}</td>
        </tr>
      </table>
      
      <p style="margin-top: 20px;">⚡ Please follow up with the customer as soon as possible.</p>
      
      <p style="color: #777; font-size: 12px; margin-top: 30px;">
        This is an automated email from Quick Service System.
      </p>
    </div>
  `,
      });

      UtilController.sendSuccess(req, res, next, {
        message: "Service request submitted successfully",
        request: newRequest,
      });
    } catch (error) {
      console.error("Error creating service request:", error);
      UtilController.sendError(req, res, next, {
        message: "Error creating service request",
        responseCode: returnCode.serverError,
      });
    }
  },

  // Get all requests
  getRequests: async (req, res, next) => {
    try {
      const requests = await QuickService.find().sort({ createdAt: -1 });
      UtilController.sendSuccess(req, res, next, { requests });
    } catch (error) {
      console.error("Error fetching service requests:", error);
      UtilController.sendError(req, res, next, {
        message: "Error fetching service requests",
        responseCode: returnCode.serverError,
      });
    }
  },

  // Get single request by ID
  getRequestById: async (req, res, next) => {
    try {
      const request = await QuickService.findById(req.params.id);
      if (!request) {
        return UtilController.sendError(req, res, next, {
          message: "Request not found",
          responseCode: returnCode.noData,
        });
      }
      UtilController.sendSuccess(req, res, next, { request });
    } catch (error) {
      console.error("Error fetching request:", error);
      UtilController.sendError(req, res, next, {
        message: "Error fetching request",
        responseCode: returnCode.serverError,
      });
    }
  },

  // Delete request
  deleteRequest: async (req, res, next) => {
    try {
      const deletedRequest = await QuickService.findByIdAndDelete(req.query.id);
      if (!deletedRequest) {
        return UtilController.sendError(req, res, next, {
          message: "Request not found",
          responseCode: returnCode.noData,
        });
      }
      UtilController.sendSuccess(req, res, next, {
        message: "Request deleted successfully",
        request: deletedRequest,
      });
    } catch (error) {
      console.error("Error deleting request:", error);
      UtilController.sendError(req, res, next, {
        message: "Error deleting request",
        responseCode: returnCode.serverError,
      });
    }
  },

  updateRequest: async (req, res, next) => {
    try {
      const updatedObj = req.body;
      const { id } = req.body;
      const updatedContact = await QuickService.findOneAndUpdate(
        { _id: id },
        updatedObj
      );
      UtilController.sendSuccess(req, res, next, {
        message: "Contact updated successfully",
        contact: updatedContact,
      });
    } catch (err) {
      console.error("Error updating contact:", err);
      UtilController.sendError(req, res, next, {
        message: "Error deleting request",
        responseCode: returnCode.serverError,
      });
    }
  },
};
