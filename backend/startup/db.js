const mongoose = require("mongoose");
const winston = require("winston");
const config = require("config");

module.exports = function() {
  const db = config.get("db");
  const options = {
    user: db.user,
    pass: db.password,
    dbName: db.database,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  };
  mongoose
    .connect(db.host, options)
    .then(() => winston.info(`Connected to ${db.host}/${db.database}...`));
};
