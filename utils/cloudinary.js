const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv").config();
const CLOUD_NAME = process.env.CLOUD_NAME;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

const cloudinaryUploadImg = async (fileToUploads) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload(fileToUploads, undefined, (err, result) => {
        resolve(
          {
            url: result.secure_url,
          },
          {
            resource_type: "auto",
          }
        );
        reject(console.error(err));
      })
      .then((result) => {
        console.log(JSON.stringify(result, null, 2));
      })
      .catch((err) => {
        console.log(JSON.stringify(err, null, 2));
      });
  });
};

module.exports = cloudinaryUploadImg;
