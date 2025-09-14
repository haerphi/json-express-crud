const fs = require("fs");
const path = require("path");

const saveDb = (db) => {
  const dataDir = path.join(process.cwd(), "data");
  const dbPath = path.join(dataDir, "db.json");
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

module.exports = saveDb;
