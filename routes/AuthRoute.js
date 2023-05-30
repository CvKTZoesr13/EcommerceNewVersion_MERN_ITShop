const express = require("express");
const { createUser } = require("../controllers/UserController");

const router = express.Router();
// create a new user
router.post("/register", createUser);
module.exports = router;
