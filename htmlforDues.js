const express = require("express");
const mongoose = require("mongoose");
const DueModel = require("./api/models/Due"); // replace with your actual path
const UserModel = require("./api/models/User"); // if you want to validate createdBy

// Utility: HTML generator
module.exports = generateHTMLForDues;
function generateHTMLForDues(dues, sign = []) {
  const totalCharges = dues.reduce(
    (sum, d) => sum + (d.overDueChargersAmount || 0),
    0
  );

  const dueType = dues?.[0]?.typeOfDueId?.dueName;
  const tenantName = dues?.[0]?.userId?.fullName;
  const mobileNo = dues?.[0]?.userId?.mobileNo;
  const unitName = dues?.[0]?.unitId?.name;
  const OwnerName = dues?.[0]?.createdBy?.fullName;
  const OwnerMobileNo = dues?.[0]?.createdBy?.mobileNo;

  const createdAtTimestamp = dues?.[0]?.createdAt || 0;
  const createdAtDate = new Date(createdAtTimestamp * 1000); // Convert to ms

  const formattedDate = createdAtDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = createdAtDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const rows = dues
    .map((due, index) => {
      const dueType =
        typeof due.typeOfDueId === "object"
          ? due.typeOfDueId?.dueName ||
            due.typeOfDueId?.name ||
            "No Description"
          : due.typeOfDueId || "No Description";
      const dueAmount = due.dueAmount || 0;
      const duplicateAmount = due.duplicateDueAmount || 0;
      const adjustedAmount = dueAmount - duplicateAmount;
      console.log("adjustedAmount: ", adjustedAmount);
      const isLast = index === dues.length - 1;
      const rowStyle = isLast
        ? ' style="border-bottom: 2px solid #97c1ff"'
        : "";

      return `
    <tr${rowStyle}>
      <td>${dueType}</td>
      <td>₹ ${dueAmount.toLocaleString("en-IN")}</td>
          <td>₹ ${adjustedAmount.toLocaleString("en-IN")}</td>
    </tr>`;
    })
    .join("");

  const totalAdjusted = dues.reduce(
    (sum, d) =>
      sum + Math.abs((d.dueAmount || 0) - (d.duplicateDueAmount || 0)),
    0
  );
  console.log("totalAdjusted: ", totalAdjusted);

  const totalDue = dues.reduce((sum, d) => sum + (d.dueAmount || 0), 0);

  const totalOverdue = dues.reduce(
    (sum, d) => sum + (d.overDueChargersAmount || 0),
    0
  );

  const totalforAll = totalDue + totalAdjusted;
  const totalRow = `
  <tr class="totals">
    <td class="paid-total" style="padding-left: 26%">Total</td>
    <td>₹ ${totalDue.toLocaleString("en-IN")}</td>
    <td>₹ ${totalAdjusted.toLocaleString("en-IN")}</td>

  </tr>`;
  // Get the first active signature if available
  const signatureImage = sign?.[0]?.signatureData;
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice</title>
    <style>
      body {
        font-family: "Arial", sans-serif;
        padding: 40px;
        color: #000;
      }

      .header {
        margin-bottom: 20px;
      }

      .header span {
        /* margin: 10p; */
      }

      .blue {
        color: #2a65f8;
        font-weight: bold;
      }

      .flex {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
      }

      .box {
        width: 48%;
      }

      .details-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 30px;
      }

      .details-table th,
      .details-table td {
        padding: 14px;
        text-align: left;
      }

      .details-table th {
        /* background-color: #f9f9f9; */
      }

      .totals {
        font-weight: bold;
      }

      .summary-box {
        /* margin-top: 40px; */
        border: 2px solid #97c1ff;
        padding: 37px;
        width: 280px;
        float: right;
        border-radius: 8px;
      }

      .summary-box div {
        margin-bottom: 10px;
        font-size: 16px;
      }

      .summary-box span {
        float: right;
      }

      .balance-red {
        color: red;
      }

      .paid-blue {
        color: #4879c7;
        font-weight: 400;
        font-size: 1.3rem;
      }
      .paid-total {
        color: #4879c7;
        /* font-weight: 400; */
        font-size: 1.3rem;
      }

      .payment-method {
        /* margin-top: 60px; */
        padding: 37px;
      }
      .flex1 {
        margin: 10px;
      }
      .flexrelated {
        display: flex;
        margin-top: 100px;
        justify-content: space-between;
      }
          .logo-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 50px;
      justify-content: space-between;
    }

    .img1 {
      width: 90px; /* You can adjust the size */
      height: auto;
    }

    .img2 {
      width: 200px; /* You can adjust the size */
      height: auto;
    }
    </style>
  </head>
  <body>
  <div class="logo-wrapper">
    <div>
          <img src="https://s3.ap-south-1.amazonaws.com/rent-door/testing/1751619077497_Group%207%201.png" alt="Rentdoor Logo" class="img1"/>
    </div>
     <div>
          <img src="https://s3.ap-south-1.amazonaws.com/rent-door/testing/1751619053252_Frame%20150.png" alt="Rentdoor Logo" class="img2"/>
    </div>
  </div>   
    <div class="header">
      <div class="flex1">
        <span>Receipt number: <span class="blue">1746353966357</span></span>
      </div>
      <div class="flex1">
 <span>
    Date: <span class="blue">${formattedDate}</span> | ${formattedTime}
  </span>      </div>
    </div>

    <div class="flex flex1">
      <div class="box">
        <div style="margin-bottom: 10px" class="paid-blue">
          <strong>Billing To</strong><br />
        </div>

        <div style="margin-bottom: 10px">
          Payee name: <strong>${tenantName}</strong>
        </div>
        <div style="margin-bottom: 10px">Unit : <strong>${unitName}</strong></div>
        <div>Contact: <strong>${mobileNo}</strong></div>
      </div>

      <div class="box">
        <div style="margin-bottom: 10px" class="paid-blue">
          <strong>Billing By</strong><br />
        </div>
        <div style="margin-bottom: 10px">
          Owner name: <strong>${OwnerName}</strong><br />
        </div>
        <div style="margin-bottom: 10px">
          Contact: <strong>${OwnerMobileNo}</strong><br />
        </div>
        <div style="margin-bottom: 10px">
          Managed by: <strong>Rentdoor Services</strong><br />
        </div>
        <div style="margin-bottom: 10px"></div>
        Address:
        <span>
          House No– 756 sec 39 Near to Unitech cyber park sec 39<br />
          Gurugram, Haryana - 122001
        </span>
      </div>
    </div>

  <table class="details-table">
  <thead style="border-bottom: 2px solid #97c1ff">
    <tr>
      <th>Details</th>
      <th>Due</th>
      <th>Over due charges</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
    ${totalRow}
  </tbody>
</table>

    <div class="flexrelated">
      <div class="payment-method">
        <div class="" style="margin-bottom: 20px">PAYMENT METHOD</div>
        <div class="paid-blue">PAYMENT METHOD</div>
        <div style="margin-top: 10px">${tenantName}</div>
      </div>

      <div class="summary-box">
        <div style="color: #7a8391">
          Due
          <span style="font-weight: 600; font-size: 18px; color: #555759"
            >    ₹ ${totalDue.toLocaleString("en-IN")}</span
          >
        </div>
        <div style="color: #7a8391">
          Charges
          <span style="font-weight: 600; font-size: 18px; color: #555759"
            >₹ ${totalAdjusted.toLocaleString("en-IN")}</span
          >
        </div>
        <div style="color: #7a8391">
          Paid
          <span style="font-weight: 600; font-size: 18px; color: #4879c7"
            >₹ ${totalforAll.toLocaleString("en-IN")}</span
          >
        </div>
      </div>
    </div>
  </body>
</html>
`;
}
