const express = require("express");
const {
  uploadImages,
  uploadAllImages,
  deleteImages,
} = require("../controllers/UploadController");
const router = express.Router();
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");

// upload product's images
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);
// upload product's images
router.put(
  "/",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadAllImages
);

// delete product's images
router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);
module.exports = router;
