const express = require("express");
const {
  createUser,
  loginUser,
  getAllUsers,
  getAUser,
  deleteAUser,
  updateAUser,
} = require("../controllers/UserController");

const router = express.Router();
// create a new user
router.post("/register", createUser);
//login
router.post("/login", loginUser);
// get all users
router.get("/all-users", getAllUsers);
// get a single user
router.get("/:id", getAUser);
// delete a single user
router.delete("/:id", deleteAUser);
// update a single user
router.put("/:id", updateAUser);

module.exports = router;
