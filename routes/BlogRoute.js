const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeTheBlog,
  dislikeTheBlog,
} = require("../controllers/BlogController");
const router = express.Router();
const { uploadPhoto, blogImgResize } = require("../middlewares/uploadImages");
const { uploadImages } = require("../controllers/BlogController");
// create an user's blog
router.post("/", authMiddleware, isAdmin, createBlog);
// upload images
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 2),
  blogImgResize,
  uploadImages
);

// like or dislike
router.put("/likes", authMiddleware, isAdmin, likeTheBlog);
router.put("/dislikes", authMiddleware, isAdmin, dislikeTheBlog);
// update an user's blog
router.put("/:id", authMiddleware, isAdmin, updateBlog);
// get an user's blog
router.get("/:id", getBlog);
// get all blogs
router.get("/", getAllBlogs);
// delete an user's blog
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);

module.exports = router;
