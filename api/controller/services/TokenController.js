const jwt = require("jsonwebtoken");
const UtilController = require("./../services/UtilController");

module.exports = {
  refreshToken: async (req, res, next) => {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
      UtilController.sendSuccess(req, res, next, {
        message: "No refresh token found",
      });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, decoded) => {
      if (err) {
        UtilController.sendSuccess(req, res, next, {
          message: "Invalid refresh token",
        });
      }

      const tokens = module.exports.createToken(decoded.uid, decoded.userType);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: "production",
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      });

      return UtilController.sendSuccess(req, res, next, {
        accessToken: tokens.accessToken,
      });
    });
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.PASSWORD_SECRET_KEY);
    } catch (err) {
      return null;
    }
  },

  createToken: (uid, userType) => {
    try {
      const payload = { uid, userType };

      return {
        accessToken: jwt.sign(payload, process.env.PASSWORD_SECRET_KEY, {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }),
        refreshToken: jwt.sign(payload, process.env.REFRESH_SECRET_KEY, {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }),
      };
    } catch (error) {
      console.error("Error creating tokens:", error);
      return null;
    }
  },

  addUserToReq(req, userObj) {
    if (!req || !userObj) return req;
    req.user = { ...req.user, ...userObj };
    return req;
  },
};
