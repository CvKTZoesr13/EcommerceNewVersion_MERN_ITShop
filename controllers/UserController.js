const User = require("../models/User");
const UserOAuth = require("../models/UserOAuth");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const asyncHandler = require("express-async-handler");
const generateToken = require("../config/jsonWebToken");
const validateMongoDbId = require("../utils/validateMongoDbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./EmailController");
const crypto = require("crypto");
const uniqid = require("uniqid");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const removeFirstLetter = require("../config/removeFirstLetter");
const { isAdmin } = require("../middlewares/authMiddleware");
const dotenv = require("dotenv").config();
// exchange tokens for google oauth - gapi
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

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

// user login
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

// user login - Google - userController - using with passport
const googleOAuthLogin = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const findOAuthUser = await UserOAuth.findOne({
    email,
  });
  const findUser = await User.findOne({ email });
  if (findUser?.typeLogin === "google") {
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
      typeLogin: findOAuthUser?.typeLogin,
      isAdmin: findUser?.isAdmin,
      accessToken: generateToken(findUser?._id),
    });
  }

  // refreshToken in OAuthUser model
  const sysRefreshToken = await generateRefreshToken(findOAuthUser?._id);
  const updateUser = await UserOAuth.findByIdAndUpdate(
    findOAuthUser?._id,
    {
      refreshToken: sysRefreshToken,
    },
    { new: true }
  );
});

// user login - Google - using with google api javascript client - https://github.com/google/google-api-javascript-client
const gapiLogin = asyncHandler(async (req, res) => {
  const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
  // console.log(tokens);
  const response = await axios.get(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`
  );
  // console.log(response);
  const user = response.data;
  // create new user
  const findAUser = await UserOAuth.findOne({
    email: user.email,
  });
  if (!findAUser) {
    try {
      const userData = {
        firstName:
          user.family_name === undefined
            ? user.given_name.split(" ")[0]
            : user.family_name,
        lastName: user.given_name,
        email: user.email,
        mobile: crypto.randomUUID(),
        typeLogin: "google",
        locale: user.locale,
      };
      const newOAuthUser = await UserOAuth.create(userData);
      const newUser = await User.create(userData);
      console.log(newOAuthUser, newUser);
    } catch (error) {
      throw new Error(error);
    }
  } else {
    console.log("User exists! User's id: " + findAUser?._id);
  }
  // end create new user
  const findUser = await User.findOne({ email: user.email });
  if (findUser?.typeLogin === "google") {
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
      typeLogin: findAUser?.typeLogin,
      isAdmin: findUser?.isAdmin,
      accessToken: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }

  // refreshToken in OAuthUser model
  const sysRefreshToken = await generateRefreshToken(findAUser?._id);
  const updateUser = await UserOAuth.findByIdAndUpdate(
    findAUser?._id,
    {
      refreshToken: sysRefreshToken,
    },
    { new: true }
  );
});

const githubLogin = asyncHandler(async (req, res) => {
  try {
    const code = req.query.code; // exchange code for tokens
    const githubClientID = process.env.GITHUB_CLIENT_ID;
    const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
    //async await
    console.log("Github's code: " + code);
    const response = await axios.post(
      `https://github.com/login/oauth/access_token?client_id=${githubClientID}&client_secret=${githubClientSecret}&code=${code}`,
      {},
      {
        headers: {
          accept: "application/json",
        },
      }
    );
    console.log(response.data);
    if (response.data.error) {
      res.status(400).json({ message: "Invalid Credentials", success: false });
    }

    // using access token from response
    const { access_token } = response.data;
    if (access_token) {
      const userData = await axios.get(`https://api.github.com/user`, {
        headers: {
          accept: "application/json",
          Authorization: `token ${access_token}`,
        },
      });
      console.log("User's data: ", userData.data);
      const user = userData.data;
      // create new user from data that is returned by github api
      const findAUser = await UserOAuth.findOne({
        email: `${user.id}+${user.login}@users.noreply.github.com`,
      });
      if (!findAUser) {
        try {
          console.log("User doesn't exist in database -> create new user!");
          const userResponse = {
            firstName: user.name ? user.name.split(" ")[0] : user.login,
            lastName:
              removeFirstLetter(user.name) === user.name
                ? user.name
                : removeFirstLetter(user.name),
            email:
              user.email === null
                ? `${user.id}+${user.login}@users.noreply.github.com`
                : user.email,
            mobile: crypto.randomUUID(),
            typeLogin: "github",
            locale: user.location,
          };
          const newOAuthUser = await UserOAuth.create(userResponse);
          const newUser = await User.create(userResponse);
          console.log(newOAuthUser, newUser);
          console.log("Created new user successfully!");
        } catch (error) {
          throw new Error(error);
        }
      } else {
        console.log("User exists! User's id: " + findAUser?._id);
      }

      // end of create new user -> login processing
      const findUser = await User.findOne({
        email: `${user.id}+${user.login}@users.noreply.github.com`,
      });
      if (findUser?.typeLogin === "github") {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(
          findUser.id,
          { refreshToken: refreshToken },
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
          typeLogin: findUser?.typeLogin,
          isAdmin: findUser?.isAdmin,
          accessToken: generateToken(findUser?._id),
        });
      } else {
        throw new Error("Invalid Credentials");
      }
    }
  } catch (error) {
    throw new Error(error);
  }
});

// admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //   check if user exists
  const findAdmin = await User.findOne({ email });
  if (findAdmin.isAdmin !== "admin")
    // throw new Error("This account has no permission.");
    res.status(403).json({
      message: "This account has no permission.",
    });
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateUser = await User.findByIdAndUpdate(
      findAdmin.id,
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
      _id: findAdmin?._id,
      firstName: findAdmin?.firstName,
      lastName: findAdmin?.lastName,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      isAdmin: findAdmin?.isAdmin,
      accessToken: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// save user's address
const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updateAUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
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
      "There is no refresh token in cookies. Please login and try again!"
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

// POST
// forgot password
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user?.createPasswordResetToken();
    await user.save();
    const resetURL =
      `Có vẻ bạn đang gặp sự cố đăng nhập, xin hãy nhấn vào liên kết này để đặt lại mật khẩu của bạn. ` +
      `Liên kết này khả dụng trong vòng 10 phút kể từ thời gian bạn nhận được email này. ` +
      `<a href='http://localhost:5000/api/user/reset-password/${token}'>Nhấn vào đây</a>`;

    const data = {
      to: email,
      text: "Xin chào",
      subject: "Quên mật khẩu - Forgot password",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

// PUT
// reset user's password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token expired, please try it again.");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

// GET
// get wishlist of an user
const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (err) {
    throw new Error(err);
  }
});

// user's cart
const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let products = [];
    let object = {};
    let getPrice;
    const getAllProductInCart = Cart.find();
    const user = await User.findById(_id);
    // check if user already has product in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      const deletedCart = await Cart.findOneAndDelete({ orderby: user._id });
      res.json({
        deletedCart,
        message: "Error, duplicated cart, this have been removed!",
      });
    } else {
      for (let i = 0; i < cart.length; i++) {
        object.product = cart[i]._id;
        object.count = cart[i].count;
        object.color = cart[i].color;
        getPrice = await Product.findById(cart[i]._id).select("price").exec();
        object.price = getPrice.price;

        products.push({ ...object });
      }
      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        cartTotal += products[i].count * products[i].price;
      }
      let newCart = await new Cart({
        products,
        cartTotal,
        orderby: user?._id,
      }).save();
      res.json(newCart);
    }
  } catch (error) {
    throw new Error(error);
  }
});

// GET user's cart
const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    const user = await User.findById(_id).select("firstName lastName");
    if (cart === null) {
      res.json({
        user,
        message: "There is no product in cart.",
      });
    }
    res.json({
      user,
      cart,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.deleteMany({});
    const user = await User.findById(_id).select("firstName lastName");
    res.json({
      user,
      cart,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// apply coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (!validCoupon) throw new Error("Invalid coupon or it expired!");
  const user = await User.findOne({ _id });
  let countCart = await Cart.countDocuments();

  if (countCart !== 0) {
    let { products, cartTotal } = await Cart.findOne({
      orderby: user._id,
    }).populate("products.product");
    let totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);
    const cart = await Cart.findOneAndUpdate(
      { orderby: user._id },
      { totalAfterDiscount },
      { new: true }
    );
    res.json({ cart, coupon });
  } else {
    res.json({
      success: false,
      message: "Cannot apply coupon due to there is no product in cart.",
    });
  }
});

// create order
const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmount = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount * 100;
    } else {
      finalAmount = userCart.cartTotal * 100;
    }
    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmount,
        status: "Cash on delivery",
        created: new Date().toJSON().slice(0, 10),
        currency: ["usd", "vnd", "jpy"],
      },
      orderby: user._id,
      orderStatus: "Cash on delivery",
    }).save();

    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });

    const updated = await Product.bulkWrite(update, {});
    res.json({ message: "You have been ordered successfully!" });
  } catch (error) {
    throw new Error(error);
  }
});
// GET Orders are owned by an user
const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userOrders = await Order.find({ orderby: _id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userOrders);
  } catch (error) {
    throw new Error(error);
  }
});
// GET all orders (admin user only)
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const getAllOrders = await Order.find()
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(getAllOrders);
  } catch (error) {
    throw new Error(error);
  }
});
// POST an order by user id (for admin panel)
const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userOrders = await Order.find({ orderby: id })
      .populate("products.product")
      .populate({ path: "orderby", select: "_id firstName lastName address" })
      .exec();
    res.json(userOrders);
  } catch (error) {
    throw new Error(error);
  }
});

// UPDATE order's status - delivered - delivering - cancelled
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  loginAdmin,
  googleOAuthLogin,
  getAllUsers,
  getAUser,
  deleteAUser,
  updateAUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderByUserId,
  gapiLogin,
  githubLogin,
};
