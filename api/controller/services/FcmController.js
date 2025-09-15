const jwt = require("jsonwebtoken");
const axios = require("axios");
const serviceAccount = require("../../../google-services.json");

module.exports = {
  getAccessTokens: function () {
    const payload = {
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: "https://oauth2.googleapis.com/token",
      scope: "https://www.googleapis.com/auth/firebase.messaging",
    };

    const options = {
      algorithm: "RS256",
      expiresIn: "1h",
      header: {
        typ: "JWT",
        alg: "RS256",
        kid: serviceAccount.private_key_id,
      },
    };

    const token = jwt.sign(payload, serviceAccount.private_key, options);
    return token;
  },
  sendFcmNotification: async function (fcmId, notification) {
    let fcmData = {};
    let sound = "default";
    if (notification.type == "poster") {
      sound = "clock_alarm";
    }
    try {
      fcmData = {
        title: notification.title,
        sound: sound,
        body: notification.body,
        userType: notification.userType,
        subject: notification.subject,
        recordId: notification.recordId,
        icon: "https://ovaltine.s3.ap-south-1.amazonaws.com/LOGO_Ovantine-compressed.jpg",
        poster: notification.poster,
        type: notification.type,
        actionId: notification.actionId,
        actionTitle: notification.actionTitle,
        isScheduled: notification.isScheduled,
        scheduledTime: notification.scheduledTime,
        url: notification.url,
      };

      const accessToken = await module.exports.getAccessToken();
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: fcmData,
        token: fcmId,
      };

      const response = await axios.post(
        `https://fcm.googleapis.com/v1/projects/artful-timing-412905/messages:send`,
        { message },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log(`Notification Response:`, response.data);
      console.log("fcm status", response.status);

      // ✅ Return response status or data
      return {
        success: response.status === 200,
        response: response.data,
      };
    } catch (error) {
      console.error(error);

      // ✅ Return failure response
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getAccessToken: async function () {
    try {
      // Generate the JWT
      let jwtToken = module.exports.getAccessTokens();

      // Request the access token from Google
      const response = await axios.post("https://oauth2.googleapis.com/token", {
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwtToken,
      });

      if (response.data && response.data.access_token) {
        // console.log("Access token received:", response.data.access_token);
        return response.data.access_token;
      } else {
        throw new Error("No access token in response");
      }
    } catch (error) {
      console.error(
        "Error fetching access token:",
        error.response ? error.response.data : error.message
      );
      throw new Error("Failed to get access token");
    }
  },

  sendFcmToAll: async function (notification, fcm_tokens = []) {
    try {
      if (fcm_tokens.length <= 0) {
        return;
      }

      // Get the access token
      const accessToken = await module.exports.getAccessToken();

      // Prepare FCM data
      const fcmData = {
        title: notification.title,
        sound: "default",
        body: notification.body,
        subject: notification.subject,
        recordId: notification.recordId,
        icon: "https://ovaltine.s3.ap-south-1.amazonaws.com/LOGO_Ovantine-compressed.jpg",
        poster: notification.poster,
        type: notification.type,
        actionId: notification.actionId,
        actionTitle: notification.actionTitle,
        isScheduled: notification.isScheduled,
        scheduledTime: notification.scheduledTime,
        url: notification.url,
      };

      // Send notifications for each token individually
      for (const token of fcm_tokens) {
        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: fcmData, // Additional data
          token: token, // Send notification to each token
        };

        try {
          const response = await axios.post(
            `https://fcm.googleapis.com/v1/projects/artful-timing-412905/messages:send`,
            { message: message },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          console.log(
            `Notification sent to token: ${token}, Response:`,
            response.data
          );
          console.log("fcm status", response.status);
        } catch (error) {
          console.error(
            `Error sending to token ${token}:`,
            error.response ? error.response.data : error.message
          );
        }
      }
    } catch (error) {
      console.error(
        "Error sending FCM notifications:",
        error.response ? error.response.data : error.message
      );
    }
  },
};
