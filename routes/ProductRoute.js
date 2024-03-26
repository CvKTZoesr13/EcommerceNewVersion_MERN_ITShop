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
  uploadAllImages,
  deleteImages,
} = require("../controllers/ProductController");
const router = express.Router();
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");
const isCached = require("../middlewares/redisCached");

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
// upload product's images
router.put(
  "/upload",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadAllImages
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
// delete product's images
router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);
// get all products
router.get("/", getAllProducts);
module.exports = router;
