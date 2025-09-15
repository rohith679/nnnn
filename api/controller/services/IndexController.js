const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");
const ejs = require("ejs");
const moment = require("moment/moment");
const AwsController = require("./AwsController");
const UtilController = require("./UtilController");

module.exports = {
  pdfGenerator: async (orderObj) => {
    const generatePDFfromHTML = async (htmlContent) => {
      return new Promise((resolve, reject) => {
        pdf.create(htmlContent).toBuffer((err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer);
          }
        });
      });
    };

    try {
      let templatePath = path.join(__dirname, "./Ejs template/index.ejs");
      let templateContent = fs.readFileSync(templatePath, "utf8");
      orderObj["formattedDate"] = moment
        .unix(orderObj?.createdAt)
        .format("DD/MM/YYYY");
      // calculation part
      orderObj["igstValue"] = "18%";
      orderObj["cgstValue"] = "9%";
      orderObj["sgstValue"] = "9%";
      orderObj["state"] = orderObj?.billingDetails?.state?.toLowerCase();

      // Calculate tax amounts based on state
      if (orderObj?.state === "karnataka") {
        // Karnataka: Apply CGST and SGST
        const taxableAmount = orderObj?.baseAmount - orderObj?.discountAmount;
        orderObj["cgst"] = Number((taxableAmount * 0.09).toFixed(2));
        orderObj["sgst"] = Number((taxableAmount * 0.09).toFixed(2));
        orderObj["igst"] = 0; // No IGST for Karnataka

        // Final amount = base amount + CGST + SGST
        orderObj["finalAmount"] = (
          taxableAmount +
          orderObj?.cgst +
          orderObj?.sgst
        )?.toFixed(2);
      } else {
        const taxableAmount = orderObj?.baseAmount - orderObj?.discountAmount;
        // Other states: Apply IGST only
        orderObj["igst"] = Number((taxableAmount * 0.18).toFixed(2));
        orderObj["cgst"] = 0; // No CGST
        orderObj["sgst"] = 0; // No SGST

        // Final amount = base amount + IGST
        orderObj["finalAmount"] = (taxableAmount + orderObj?.igst)?.toFixed(2);
      }

      let renderedHtml = ejs.render(templateContent, { orderObj });

      const pdfBuffer = await generatePDFfromHTML(renderedHtml);
      let filePath = path.join(__dirname, "attachment.pdf");
      fs.writeFileSync(filePath, pdfBuffer);

      const pathLink = await UtilController.uploadInvoiceFiles(
        pdfBuffer,
        filePath
      );
      fs.unlinkSync(filePath);
      return pathLink;
    } catch (error) {
      console.log("pdfGenerator: ", error);
    }
  },
};
