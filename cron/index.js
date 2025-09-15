const Dues = require("../api/models/Due");
const cron = require("node-cron");
const Notification = require("../api/models/Notification");
const FcmController = require("../api/controller/services/FcmController");
const MoveInReport = require("../api/models/MoveInReport");
const User = require("../api/models/User");

// cron.schedule("* * * * * *", async () => {
// cron.schedule("* * * * *", async () => {
//   try {
//     const today = Math.floor(Date.now() / 1000);

//     // Find all overdue dues where leastDate has passed
//     const overdueDues = await Dues.find({
//       leastDate: { $lt: today },
//       isOverdue: { $ne: true }, // Prevent multiple updates per cycle
//     });

//     if (overdueDues.length === 0) {
//       console.log("No overdue dues found.");
//       return;
//     }

//     for (const due of overdueDues) {
//       let updatedDueAmount = due.dueAmount;
//       let nextLeastDate = due.leastDate;

//       // Determine the increment based on increaseDueBaseOnDay
//       let incrementDays = 0;
//       if (due.increaseDueBaseOnDay === "day") {
//         incrementDays = 1;
//       } else if (due.increaseDueBaseOnDay === "week") {
//         incrementDays = 7;
//       } else if (due.increaseDueBaseOnDay === "month") {
//         incrementDays = 30;
//       }

//       // Increase due amount
//       updatedDueAmount += due.overDueChargersAmount;

//       // Move leastDate forward by the correct number of days
//       nextLeastDate += incrementDays * 24 * 60 * 60;

//       // Update overdue due
//       await Dues.updateOne(
//         { _id: due._id },
//         {
//           $set: {
//             dueAmount: updatedDueAmount,
//             isOverdue: true,
//             isOverdueCharged: true,
//             leastDate: nextLeastDate, // Move leastDate forward
//             updatedAt: Math.floor(Date.now() / 1000),
//           },
//         }
//       );
//     }

//     console.log(`Updated ${overdueDues.length} overdue records`);
//   } catch (error) {
//     console.error("Error updating overdue dues:", error);
//   }
// });
// cron.schedule("* * * * *", async () => {
//   try {
//     const now = Math.floor(Date.now() / 1000);

//     // Find overdue dues (test with minute-based expiration)
//     const overdueDues = await Dues.find({ leastDate: { $lt: now } });

//     if (overdueDues.length === 0) {
//       console.log("No overdue dues found.");
//       return;
//     }

//     for (let due of overdueDues) {
//       let newLeastDate;

//       // Faster testing: Increase based on minutes instead of days/weeks/months
//       if (due.increaseDueBaseOnDay === "day") {
//         console.log("day");

//         newLeastDate = due.leastDate + 2 * 60; // Every 2 minutes for testing
//       } else if (due.increaseDueBaseOnDay === "week") {
//         newLeastDate = due.leastDate + 5 * 60; // Every 5 minutes for testing
//       } else if (due.increaseDueBaseOnDay === "month") {
//         console.log("2345");
//         newLeastDate = due.leastDate + 10 * 60; // Every 10 minutes for testing
//       }

//       // if (due.increaseDueBaseOnDay === "day") {
//       //   newLeastDate = due.leastDate + 24 * 60 * 60; // +1 day
//       // } else if (due.increaseDueBaseOnDay === "week") {
//       //   newLeastDate = due.leastDate + 7 * 24 * 60 * 60; // +1 week
//       // } else if (due.increaseDueBaseOnDay === "month") {
//       //   const currentDate = new Date(due.leastDate * 1000);
//       //   currentDate.setMonth(currentDate.getMonth() + 1);
//       //   newLeastDate = Math.floor(currentDate.getTime() / 1000); // Convert to seconds
//       // } else {
//       //   console.log(
//       //     `Unknown increaseDueBaseOnDay value: ${due.increaseDueBaseOnDay}`
//       //   );
//       //   continue;
//       // }

//       await Dues.updateOne(
//         { _id: due._id },
//         {
//           $set: {
//             dueAmount: due.dueAmount + due.overDueChargersAmount,
//             leastDate: newLeastDate,
//             updatedAt: now,
//           },
//         }
//       );
//       console.log(
//         `Updated overdue due ID ${due._id}: New dueAmount = ${
//           due.dueAmount + due.overDueChargersAmount
//         }, Next leastDate = ${newLeastDate}`
//       );
//     }
//   } catch (error) {
//     console.error("Error updating overdue dues:", error);
//   }
// });
cron.schedule("0 0 * * *", async () => {
  try {
    const now = Math.floor(Date.now() / 1000);

    // Find overdue dues (test with minute-based expiration)
    const overdueDues = await Dues.find({
      cronJobDueDate: { $lt: now },
      paidDue: false,
    });

    if (overdueDues.length === 0) {
      console.log(
        "No overdue dues found. change   ELECTRICITY_BILL  ELECTRICITY_BILL"
      );
      return;
    }

    for (let due of overdueDues) {
      let newLeastDate = due.cronJobDueDate; // Default to current leastDate

      if (due.increaseDueBaseOnDay === "day") {
        console.log("Increasing due for day-based dues.");
        newLeastDate = now + 24 * 60 * 60; // Add 1 day (in seconds)
      } else if (due.increaseDueBaseOnDay === "week") {
        console.log("Increasing due for week-based dues.");
        newLeastDate = now + 7 * 24 * 60 * 60; // Add 1 week (in seconds)
      } else if (due.increaseDueBaseOnDay === "month") {
        console.log("Increasing due for month-based dues.");
        newLeastDate = now + 30 * 24 * 60 * 60; // Add ~1 month (30 days in seconds)
      }
      // if (due.increaseDueBaseOnDay === "day") {
      //   console.log("Increasing due for day-based dues.");
      //   newLeastDate = now + 2 * 60; // Increase every 2 minutes for testing
      // } else if (due.increaseDueBaseOnDay === "week") {
      //   console.log("Increasing due for week-based dues.");
      //   newLeastDate = now + 5 * 60; // Increase every 5 minutes for testing
      // } else if (due.increaseDueBaseOnDay === "month") {
      //   console.log("Increasing due for month-based dues.");
      //   newLeastDate = now + 10 * 60; // Increase every 10 minutes for testing
      // }

      // // Ensure leastDate moves into the future
      // if (newLeastDate <= now) {
      //   newLeastDate = now + 10 * 60; // Ensure it's always ahead
      // }

      await Dues.updateOne(
        { _id: due._id },
        {
          $set: {
            dueAmount: due.dueAmount + due.overDueChargersAmount,
            // leastDate: newLeastDate,
            cronJobDueDate: newLeastDate,
            updatedAt: now,
          },
        }
      );

      console.log(
        `Updated overdue due ID ${due._id}: New dueAmount = ${
          due.dueAmount + due.overDueChargersAmount
        }, Next leastDate = ${newLeastDate}  `
      );
    }
  } catch (error) {
    console.error("Error updating overdue dues:", error);
  }
});
// Run every day at 9 AM
cron.schedule("0 9 * * *", async () => {
  console.log("Running daily tenant reminder cron...");

  try {
    const reports = await MoveInReport.find({
      $or: [
        {
          $and: [
            { TypeOfReport: "MOVEIN" },
            {
              $or: [
                { moveInReport: false },
                { moveInReport: { $exists: false } },
              ],
            },
          ],
        },
        {
          $and: [
            { TypeOfReport: "MOVEIN" },
            {
              $or: [
                { moveOutReport: false },
                { moveOutReport: { $exists: false } },
              ],
            },
          ],
        },
      ],
    }).populate("tenantId", "fcmToken fullName");
    console.log("reports: ", reports);

    for (let report of reports) {
      const tenant = report.tenantId;
      if (tenant?.fcmToken) {
        const payload = {
          userId: tenant._id,
          title: "Pending Move Report Agreement",
          senderId: null,
          body: `Hi ${tenant.fullName}, please review and agree to your pending move-in or move-out report.`,
          attachment: null,
          type: "Reminder",
          notificationType: "normal",
          actionUrl: "/tenant/move-in-reports", // Or make it dynamic
          createdBy: null,
        };

        const fcmResult = await FcmController.sendFcmNotification(
          tenant.fcmToken,
          payload
        );

        await Notification.create({
          ...payload,
          fcmStatus: fcmResult?.success ? "SENT" : "FAILED",
        });
      }
    }

    console.log("Reminder notifications sent successfully.");
  } catch (error) {
    console.error("Error sending tenant reminder notifications:", error);
  }
});

cron.schedule("0 9 * * *", async () => {
  console.log("Running daily lead follow-up reminder...");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEpoch = Math.floor(today.getTime() / 1000); // Convert to seconds

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowEpoch = Math.floor(tomorrow.getTime() / 1000); // Convert to seconds

    // Find leads with viewDate = today
    const leads = await User.find({
      visitDate: { $gte: todayEpoch, $lt: tomorrowEpoch },
    }).populate("createdBy", "fcmToken fullName");
    console.log("leads: ", leads);

    for (let lead of leads) {
      const user = lead.createdBy;

      if (user?.fcmToken) {
        const payload = {
          userId: user._id,
          title: "Lead Follow-Up Reminder",
          senderId: null,
          body: `Hi ${user.fullName}, you have a lead scheduled for follow-up today.`,
          attachment: null,
          type: "LeadReminder",
          notificationType: "normal",
          actionUrl: "/leads/view", // Adjust based on your frontend
          createdBy: null,
        };

        const fcmResult = await FcmController.sendFcmNotification(
          user.fcmToken,
          payload
        );

        await Notification.create({
          ...payload,
          fcmStatus: fcmResult?.success ? "SENT" : "FAILED",
        });
      }
    }

    console.log("✅ Lead follow-up notifications sent.");
  } catch (error) {
    console.error("❌ Error sending lead reminders:", error);
  }
});
