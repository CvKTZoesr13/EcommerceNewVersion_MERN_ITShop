const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    // split 'Bearer' <-> 'access token'
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      throw new Error(
        "Access denied. Token expired or invalid -> Please login."
      );
    }
  } else {
    throw new Error("Access denied. Invalid token!");
  }
});

// check if account is admin
const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (adminUser?.isAdmin != "admin") {
    throw new Error(
      "This account has no permission to maintain. You aren't an administrator."
    );
  } else {
    next();
  }
});
module.exports = { authMiddleware, isAdmin };
