const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const generateToken = require("../config/jsonWebToken");
const validateMongoDbId = require("../utils/validateMongoDbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");

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
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstName: findUser?.firstName,
      lastName: findUser?.lastName,
      email: findUser?.email,
      mobile: findUser?.mobile,
      isAdmin: findUser?.isAdmin,
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
  validateMongoDbId(id);
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

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  console.log(cookie);
  if (!cookie?.refreshToken)
    throw new Error(
      "There is no refresh token in cookies. Please check it and try again!"
    );
  const refreshToken = cookie.refreshToken;
  console.log(refreshToken);
  const user = await User.findOne({ refreshToken });
  if (!user)
    throw new Error("There is no refresh token in database or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("Something went wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
  res.json(user);
});

// logout functionality
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken)
    throw new Error(
      "There is no refresh token in cookies, perhaps you logged out. Please check it and try again!"
    );
  const refreshToken = cookie.refreshToken;
  const user = User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// update a single user
const updateAUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updateAUser = await User.findByIdAndUpdate(
      _id,
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
  validateMongoDbId(id);
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

// block a single user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const blockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "This user have been blocked successfully!",
    });
  } catch (error) {
    throw new Error(error);
  }
});
// unblock a single user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unBlockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "This user have been unblocked successfully!",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// update user's password functionality
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getAUser,
  deleteAUser,
  updateAUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
};
