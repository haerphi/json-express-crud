// middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.token.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
};

// middleware to check if user is connected (i.e., has a valid token)
const isConnected = (req, res, next) => {
  if (req.token) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

const authorizeFactory = (collectionName, authConfig, action) => {
  const middlewares = [];

  if (authConfig) {
    if (authConfig[action] === "admin") {
      middlewares.push(isConnected);
      middlewares.push(isAdmin);
    } else if (
      authConfig[action] === "connected" ||
      authConfig[action] === "owner"
    ) {
      middlewares.push(isConnected);
    }

    // Note owner role is handle in the route (since we check the "ownerId" field of the resource)
  }

  return middlewares;
};

module.exports = authorizeFactory;
