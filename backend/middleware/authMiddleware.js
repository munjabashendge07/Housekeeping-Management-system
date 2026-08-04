const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.authorization) {
      token = req.headers.authorization;
    }

    if (!token) {
      return res.status(401).json({
        message: "No Token Provided, Access Denied",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded; // { id, role }

    // Optionally attach fresh user object if needed
    const userExists = await User.findById(decoded.id).select("-password");
    if (!userExists) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.currentUser = userExists;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or Expired Token",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user?.role || "unknown"}' is not authorized.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };