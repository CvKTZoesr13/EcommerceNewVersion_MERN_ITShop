const User = require("../models/User");
const asyncHandler = require("express-async-handler");

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    // create a new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    // throw error - user already exist
    // res.status(500).json({
    //   success: false,
    //   message: "User already exist",
    // });
    throw new Error("User already exists");
  }
});

module.exports = { createUser };
