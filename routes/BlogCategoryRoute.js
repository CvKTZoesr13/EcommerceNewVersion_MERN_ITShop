const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
} = require("../controllers/BlogCategoryController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// create category
router.post("/", authMiddleware, isAdmin, createCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.get("/", getAllCategory);
router.get("/:id", getCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);
module.exports = router;
