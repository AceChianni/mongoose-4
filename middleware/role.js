// middleware/role.js

const ROLE = {
  ADMIN: "admin",
  USER: "user",
};

const authorize = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Insufficient role" });
  }

  next();
};

module.exports = { authorize, ROLE };
