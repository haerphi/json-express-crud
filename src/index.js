#!/usr/bin/env node

const express = require("express");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const authenticate = require("./middlewares/authenticate");
const routeFactory = require("./factory/route-factory");
const authenticationRoutes = require("./factory/authentication-routes");

const app = express();
const port = 3000;

// Load files from "data" directory (from the executable location)
const dataDir = path.join(process.cwd(), "data");

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Load db.json if it exists, otherwise initialize an empty object
let db = { users: [] };
const dbPath = path.join(dataDir, "db.json");
if (fs.existsSync(dbPath)) {
  const rawData = fs.readFileSync(dbPath);
  db = JSON.parse(rawData);
} else {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Load auth.json if it exists, otherwise initialize an empty object
let auth = {
  users: {
    create: "everyone",
    update: "owner",
    delete: "admin",
    read: "owner",
    readAll: "admin",
  },
};
const authPath = path.join(dataDir, "auth.json");
if (fs.existsSync(authPath)) {
  const rawAuth = fs.readFileSync(authPath);
  auth = JSON.parse(rawAuth);
} else {
  fs.writeFileSync(authPath, JSON.stringify(auth, null, 2));
}

// Static folder "public"
app.use(express.static(path.join(__dirname, "../", "public")));

// Middleware to parse JSON bodies
app.use(express.json());

// Middlware Morgan for logging
app.use(morgan("dev"));

app.use(authenticate);

// Loop through db collections and create routes
Object.keys(db).forEach((collectionName) => {
  routeFactory(app, db, auth[collectionName] || {}, collectionName);
  console.log(`Routes for /${collectionName} created`);
});

// Authentication routes (login & register)
authenticationRoutes(app, db);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
