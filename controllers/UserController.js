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

// get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// get a single user
const getAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const getAUser = await User.findById(id);
    if (getAUser != null) {
      res.json({
        getAUser,
      });
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    throw new Error(error);
  }
});

// update a single user
const updateAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const updateAUser = await User.findByIdAndUpdate(
      id,
      {
        firstName: req?.body.firstName,
        lastName: req?.body.lastName,
        email: req?.body.email,
        mobile: req?.body.mobile,
      },
      {
        new: true,
      }
    );
    res.json({
      updateAUser,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// delete a single user
const deleteAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteAUser = await User.findByIdAndDelete(id);
    if (deleteAUser != null) {
      res.json({
        deleteAUser,
        success: true,
      });
    } else {
      throw new Error("User doesn't exist");
    }
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getAUser,
  deleteAUser,
  updateAUser,
};
