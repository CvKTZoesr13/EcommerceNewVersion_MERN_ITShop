require("dotenv").config();
const passport = require("passport");
const UserOAuth = require("../models/UserOAuth");
const asyncHandler = require("express-async-handler");
const { generateRefreshToken } = require("./refreshToken");
const User = require("../models/User");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/user/auth/google/callback",
    },
    asyncHandler(async (accessToken, refreshToken, profile, cb) => {
      // create new user if not exist
      const findOAuthUser = await UserOAuth.findOne({
        email: profile._json.email,
      });
      if (!findOAuthUser) {
        try {
          const userData = {
            firstName:
              profile.name.familyName === undefined
                ? profile.name.givenName.split(" ")[0]
                : profile.name.familyName,
            lastName: profile.name.givenName,
            email: profile._json.email,
            mobile: "null",
            typeLogin: profile.provider,
          };
          const newOAuthUser = await UserOAuth.create(userData);
          await User.create(userData);
          console.log(newOAuthUser);
        } catch (error) {
          throw new Error(error);
        }
      } else {
        console.log("User exists! User's id: " + findOAuthUser?._id);
      }
      return cb(null, profile);
    })
  )
);
