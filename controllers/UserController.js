const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const generateToken = require("../config/jsonWebToken");
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

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //   check if user exists
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    res.json({
      _id: findUser?._id,
      firstName: findUser?.firstName,
      lastName: findUser?.lastName,
      email: findUser?.email,
      mobile: findUser?.mobile,
      accessToken: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

module.exports = { createUser, loginUser };
