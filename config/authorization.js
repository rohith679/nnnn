module.exports = {
  admin: {
    authNotRequire: [
      // "/search/patientCaregiver"
    ], // admin mush validate authorization require for this end points then only they can process
    language: [],
  },
  user: {
    authNotRequire: [
      "/create/user",
      "/account/login",
      "/create/review",
      "/review/all",
      "/review/details",
      "/review/delete",
      "/quick-service/create",
      "/quick-service/delete",
      "/review/list/agree",
      "/create/home-section-media",
      "/upload/file",
      "/update/home-section-media",
      "/quick-service/update",
    ],

    language: [],
  },
  tenant: {
    authNotRequire: [],
    language: [],
  },
  index: {
    authNotRequire: ["/", "/config/aws"],
    language: [],
  },
};
