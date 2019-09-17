const winston = require("winston");
const fs = require("fs");
require("express-async-errors");

module.exports = function() {
  var dir = "./logs";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  winston.handleExceptions(
    new winston.transports.Console({
      colorize: true,
      prettyPrint: true
    }),
    new winston.transports.File({
      filename: "logs/uncaughtExceptions.log"
    })
  );

  process.on("unhandledRejection", ex => {
    throw ex;
  });

  winston.add(winston.transports.File, {
    filename: "logs/logfile.log"
  });
};
