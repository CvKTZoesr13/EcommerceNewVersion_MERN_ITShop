const express = require("express");
const { createUser, loginUser } = require("../controllers/UserController");

const router = express.Router();
// create a new user
router.post("/register", createUser);
router.post("/login", loginUser);
module.exports = router;
