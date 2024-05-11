const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv").config();
const textColorsCmd = require("../utils/textColorsCmd");
const capitalizeFirstLetter = require("./capitalizeFirstLetter");
const URI = process.env.DB_URI;

console.log(URI.replace(/\/\/([^:]+):([^@]+)@/g, "{username}:{password}"));
const dbConnect = () => {
  mongoose
    .connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log(textColorsCmd.FgRsGreen, "Connected to MongoDB <3"))
    .catch((err) =>
      console.log(
        "MongoDB's Connection failed!" +
          "\n" +
          capitalizeFirstLetter(err.message)
      )
    );
};

module.exports = dbConnect;
