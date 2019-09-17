const express = require("express");
const error = require("../middleware/error");

const importRoute = require("../routes/import");

module.exports = function(app) {
  app.use("/api/import", importRoute);

  app.use(error);
};
