const express = require("express");
const {
  createProduct,
  getAProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  uploadImages,
} = require("../controllers/ProductController");
const router = express.Router();
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");

// create a product
router.post("/", authMiddleware, isAdmin, createProduct);
// upload product's images
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);

// get a product
router.get("/:id", getAProduct);
// add to wishlist
router.put("/wishlist", authMiddleware, addToWishList);
// rating
router.put("/rating", authMiddleware, rating);
// update a product
router.put("/:id", authMiddleware, isAdmin, updateProduct);
// delete a product
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
// get all products
router.get("/", getAllProducts);
module.exports = router;
