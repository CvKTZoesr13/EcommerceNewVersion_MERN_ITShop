const express = require("express");
const {
  createUser,
  loginUser,
  getAllUsers,
  getAUser,
  deleteAUser,
  updateAUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
} = require("../controllers/UserController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
// create a new user
router.post("/register", createUser);
// login user
router.post("/login", loginUser);
// login admin
router.post("/login-admin", loginAdmin);
// get all users
router.get("/all-users", getAllUsers);
// refresh token
router.get("/refresh", handleRefreshToken);
// logout
router.get("/logout", logout);
// get wishlist
router.get("/wishlist", authMiddleware, getWishlist);
// get a single user
router.get("/:id", authMiddleware, isAdmin, getAUser);
// delete a single user
router.delete("/:id", deleteAUser);
// update a single user
router.put("/edit-user", authMiddleware, isAdmin, updateAUser);
// block a single user
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
// unblock a single user
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
// update user's password
router.put("/password", authMiddleware, updatePassword);
// forgot password
router.post("/forgot-password-token", forgotPasswordToken);
// reset password
router.put("/reset-password/:token", resetPassword);

module.exports = router;
