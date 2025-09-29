const multer = require("multer");
const path = require("path");
const fs = require("fs");
const saveDb = require("../json/save-db");
const authorizeFactory = require("./authorize-factory");

const isOwner = (authConfig, action, item, token) => {
  if (authConfig[action] === "owner") {
    return (
      !item.ownerId || item.ownerId === token.userId || token.role === "admin"
    );
  }

  return true;
};

const routeFactory = (app, db, auth, collectionName) => {
  const basePath = `/${collectionName}`;

  // Create
  const createMiddleware = authorizeFactory(collectionName, auth, "create");
  app.post(basePath, ...createMiddleware, (req, res) => {
    const newItem = req.body;
    // find max id and increment by 1
    newItem.id =
      db[collectionName].reduce(
        (maxId, item) => Math.max(maxId, parseInt(item.id)),
        0
      ) + 1;

    if (req.token && req.token.userId) {
      newItem.ownerId = req.token.userId;
    }

    db[collectionName].push(newItem);
    saveDb(db);
    res.status(201).json({ data: newItem });
  });

  // Read All
  const readAllMiddleware = authorizeFactory(collectionName, auth, "readAll");
  app.get(basePath, ...readAllMiddleware, (req, res) => {
    let collection = db[collectionName];

    // filtering
    Object.keys(req.query).forEach((key) => {
      if (key !== "page" && key !== "limit") {
        collection = collection.filter((item) => {
          if (item[key] === undefined) return false;

          if (Array.isArray(item[key])) {
            return item[key]
              .map((v) => v.toString().toLowerCase())
              .includes(req.query[key].toString().toLowerCase());
          }

          return item[key]
            .toString()
            .toLowerCase()
            .includes(req.query[key].toString().toLowerCase());
        });
      }
    });

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const items = collection.slice(startIndex, endIndex);

    console.log(
      `GET ${basePath} - page ${page}, limit ${limit}, items ${collection.length}`
    );

    res.json({ count: collection.length, data: items });
  });

  // Read One
  const readMiddleware = authorizeFactory(collectionName, auth, "read");
  app.get(`${basePath}/:id`, ...readMiddleware, (req, res) => {
    const item = db[collectionName].find((i) => i.id == req.params.id);
    if (item) {
      if (isOwner(auth, "read", item, req.token)) {
        return res.json({ data: item });
      } else {
        return res.status(403).json({ error: "Forbidden" });
      }
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  // Update
  const updateMiddleware = authorizeFactory(collectionName, auth, "update");
  app.put(`${basePath}/:id`, ...updateMiddleware, (req, res) => {
    const index = db[collectionName].findIndex((i) => i.id == req.params.id);
    if (index !== -1) {
      const item = db[collectionName][index];
      if (!isOwner(auth, "update", item, req.token)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      db[collectionName][index] = { ...db[collectionName][index], ...req.body };
      saveDb(db);
      res.json({ data: db[collectionName][index] });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  // Delete
  const deleteMiddleware = authorizeFactory(collectionName, auth, "delete");
  app.delete(`${basePath}/:id`, ...deleteMiddleware, (req, res) => {
    const index = db[collectionName].findIndex((i) => i.id == req.params.id);
    if (index !== -1) {
      const item = db[collectionName][index];
      if (!isOwner(auth, "delete", item, req.token)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const deletedItem = db[collectionName].splice(index, 1);
      saveDb(db);
      res.json({ data: deletedItem });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  // Upload file + associate with item
  // ---- Multer storage (dynamic destination + filename) ----
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        // formDataKey = file.fieldname
        const dir = path.join(
          process.cwd(),
          "public",
          collectionName,
          file.fieldname
        );

        fs.mkdirSync(dir, { recursive: true }); // à toi de créer le dossier
        cb(null, dir);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      // Ajoute l’extension (Multer ne le fait pas pour toi)
      const ext = path.extname(file.originalname) || "";
      cb(null, `${req.params.id}${ext.toLowerCase()}`);
    },
  });

  const upload = multer({
    storage,
    limits: { files: 1 },
  });

  // Middleware d’accès AVANT l’écriture disque
  const canUploadMiddleware = (req, res, next) => {
    const item = db[collectionName].find((i) => i.id == req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    if (!isOwner(auth, collectionName, "upload", item, req.token)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    req._item = item;
    next();
  };

  const uploadMiddleware = authorizeFactory(collectionName, auth, "upload");
  // Route d’upload
  app.post(
    `${basePath}/:id/upload`,
    ...uploadMiddleware,
    canUploadMiddleware,
    upload.any(), // accepte n'importe quelle clé
    (req, res) => {
      if (!req.files || req.files.length === 0) {
        // Aide au debug si Multer n’a rien reçu
        return res.status(400).json({
          error: "Aucun fichier reçu",
          hint: "Vérifie Content-Type: multipart/form-data et la/les clés FormData",
        });
      }

      const files = req.files.map((f) => ({
        field: f.fieldname,
        filename: path.basename(f.path),
        path: path.relative(process.cwd(), f.path).replace(/\\/g, "/"),
        size: f.size,
        mimetype: f.mimetype,
      }));

      // for each fieldname in files, update the item with the file path
      files.forEach((f) => {
        req._item[f.field] = f.path
          .replace(/\\/g, "/")
          .replace(/^public\//, "");
      });

      saveDb(db);

      return res.json({
        data: {
          message: "File uploaded successfully",
          itemId: req.params.id,
          files,
        },
      });
    }
  );
};

module.exports = routeFactory;
