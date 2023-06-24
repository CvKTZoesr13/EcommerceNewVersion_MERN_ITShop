const express = require("express");
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllBrand,
} = require("../controllers/BrandController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// create Brand
router.post("/", authMiddleware, isAdmin, createBrand);
router.put("/:id", authMiddleware, isAdmin, updateBrand);
router.delete("/:id", authMiddleware, isAdmin, deleteBrand);
router.get("/:id", getBrand);
router.get("/", getAllBrand);
module.exports = router;
