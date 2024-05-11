const asyncHandler = require("express-async-handler");
const redisClient = require("../config/redisClient");
const { FgRsRed } = require("../utils/textColorsCmd");

const isCached = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  // checking in redis
  await redisClient.get(id, (err, data) => {
    if (err) {
      console.log(FgRsRed, err);
    }
    if (data) {
      const response = JSON.parse(data);
      console.log(response);
      return res.status(200).json(response);
    }
    next();
  });
});
module.exports = isCached;
