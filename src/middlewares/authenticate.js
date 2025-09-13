const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  const [type, token] = authHeader ? authHeader.split(" ") : [];
  if (type !== "Bearer" && !token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, "a very secret key");
    req.token = payload;
  } catch (e) {
    console.log("JWT Error:", e.message);

    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

module.exports = authenticate;
