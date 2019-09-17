const config = require("config");

module.exports = function() {
  const db = config.get("db");
  if (!db) {
    throw new Error("FATAL ERROR: Database details not configured.");
  }
  if (!db.host) {
    throw new Error("FATAL ERROR: Database host details not configured.");
  }
  if (!db.database) {
    throw new Error("FATAL ERROR: Database name details not configured.");
  }
  if (!db.user) {
    throw new Error("FATAL ERROR: Database user details not configured.");
  }
  if (!db.password) {
    throw new Error("FATAL ERROR: Database password details not configured.");
  }
};
