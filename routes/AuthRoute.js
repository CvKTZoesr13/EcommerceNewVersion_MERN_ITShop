const express = require("express");
const passport = require("passport");
require("../config/passport");
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
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderByUserId,
  googleOAuthLogin,
  gapiLogin,
} = require("../controllers/UserController");
const {
  authMiddleware,
  isAdmin,
  isOAuth,
} = require("../middlewares/authMiddleware");

const router = express.Router();
// create a new user
router.post("/register", createUser);
// login user
router.post("/login", loginUser);
// login admin
router.post("/login-admin", loginAdmin);
// add to cart
router.post("/cart", authMiddleware, userCart);
// get user's cart
router.get("/cart", authMiddleware, getUserCart);
// delete all products in user's cart
router.delete("/empty-cart", authMiddleware, emptyCart);
// create, cash order
router.post("/cart/cash-order", authMiddleware, createOrder);
// get user's orders
router.get("/get-orders", authMiddleware, getOrders);
// get all orders of all users
router.get("/all-orders-all-users", authMiddleware, isAdmin, getAllOrders);
// get orders by user id
router.post(
  "/all-orders-an-user/:id",
  authMiddleware,
  isAdmin,
  getOrderByUserId
);
// apply coupon
router.post("/cart/apply-coupon", authMiddleware, applyCoupon);
// update order's status
router.put(
  "/order/update-order/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus
);
// get all users
router.get("/all-users", authMiddleware, isAdmin, getAllUsers);
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
// save user's address
router.put("/save-address", authMiddleware, saveAddress);
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

// OAuth2.0
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
router.get("/auth/google/callback", isOAuth, googleOAuthLogin);

router.post("/auth/google", gapiLogin);
router.post("/auth/google/refresh-token", async (req, res) => {
  const user = new UserRefreshClient(
    clientId,
    clientSecret,
    req.body.refreshToken
  );
  const { credentials } = await user.refreshAccessToken(); // optain new tokens
  res.json(credentials);
});

module.exports = router;
