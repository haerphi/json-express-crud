const fs = require("fs");
const path = require("path");

const saveDb = (db) => {
  const dataDir = path.join(__dirname, "../", "..", "data");
  const dbPath = path.join(dataDir, "db.json");
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

module.exports = saveDb;
