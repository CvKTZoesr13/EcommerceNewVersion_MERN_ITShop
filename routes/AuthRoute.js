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
} = require("../controllers/UserController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
// create a new user
router.post("/register", createUser);
//login
router.post("/login", loginUser);
// get all users
router.get("/all-users", getAllUsers);
// refresh token
router.get("/refresh", handleRefreshToken);
// logout
router.get("/logout", logout);
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
module.exports = router;
