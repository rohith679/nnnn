// smsService.js
const axios = require("axios");
const { airtelConfig } = require("../../../config/connection");

// templateIds can be managed dynamically based on OTP, registration, etc.

const sendOtpViaMsg91 = async ({ mobile, var1, var2, purpose }) => {
  try {
    const templateId =
      airtelConfig.templates[purpose] || airtelConfig.templates.default;

    const response = await axios.post(
      airtelConfig.baseUrl,
      {
        template_id: templateId,
        short_url: 0,
        recipients: [
          {
            mobiles: mobile,
            var1: var1,
            VAR2: var2,
          },
        ],
      },
      {
        headers: {
          authkey: airtelConfig.apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log("response: ", response);

    return response.data;
  } catch (err) {
    console.log("err: ", err);
    console.error("Msg91 Error:", err.response?.data || err.message);
    throw err;
  }
};

module.exports = { sendOtpViaMsg91 };
