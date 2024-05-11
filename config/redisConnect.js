const asyncHandler = require("express-async-handler");
const textColorsCmd = require("../utils/textColorsCmd");
const Redis = require("redis");

const DEFAULT_EXPIRATION = 3600;

const getOrSetCache = (key, cb) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, async (error, data) => {
      if (error) return reject(error);
      if (data != null) return resolve(JSON.parse(data));
      const refreshData = await cb();
      console.log(refreshData);
      if (!refreshData) {
      } else {
        redisClient.setEx(
          key,
          DEFAULT_EXPIRATION + (Math.floor(Math.random() * 100) + 1),
          JSON.stringify(refreshData)
        );
      }
      resolve(refreshData);
    });
  });
};

const redisConnect = asyncHandler(async () => {
  const redisClient = Redis.createClient({
    legacyMode: true,
  });
  console.log(textColorsCmd.FgRsYellow, "Connecting to redis...");
  try {
    await redisClient.connect();
  } catch (err) {
    console.log(textColorsCmd.FgRsRed, "Connecting to redis failed :<\n" + err);
  }
  if (redisClient.isReady)
    console.log(textColorsCmd.FgRsGreen, "Redis is running :>");
});
module.exports = { redisConnect, getOrSetCache };
