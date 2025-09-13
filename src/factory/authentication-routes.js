const jwt = require("jsonwebtoken");
const saveDb = require("../json/save-db");

const authenticationRoutes = (app, db) => {
  app.post("/auth/login", (req, res) => {
    const { email, password } = req.body;

    const user = db.users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        "a very secret key",
        { expiresIn: "999h" }
      );

      res.json({ token });
    } else {
      res.status(400).json({ error: "Invalid credentials" });
    }
  });

  app.post("/auth/register", (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = db.users.find((u) => u.email === req.body.email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const newUser = {
      id:
        db.users.reduce(
          (maxId, item) => Math.max(maxId, parseInt(item.id)),
          0
        ) + 1,
      email: req.body.email,
      password: req.body.password, // In a real app, hash the password
      role: req.body.role || "user", // Default role is 'user'
    };
    db.users.push(newUser);
    saveDb(db);
    res.status(201).json({ message: "User registered", userId: newUser.id });
  });

  app.get("/auth/me", (req, res) => {
    if (req.token && req.token.userId) {
      const user = db.users.find((u) => u.id == req.token.userId);
      if (user) {
        const { password, ...userData } = user; // Exclude password
        return res.json(userData);
      }
    }
    res.status(401).json({ error: "Unauthorized" });
  });
};

module.exports = authenticationRoutes;
