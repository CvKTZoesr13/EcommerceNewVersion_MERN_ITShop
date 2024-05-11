const Redis = require("redis");
const redisClient = Redis.createClient({
  legacyMode: true,
});

module.exports = redisClient;
