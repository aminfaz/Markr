const express = require("express");
const error = require("../middleware/error");

const importRoute = require("../routes/import");
const results = require("../routes/results");

module.exports = function(app) {
  app.use("/api/import", importRoute);

  app.use("/api/results", results);

  app.use(error);
};
