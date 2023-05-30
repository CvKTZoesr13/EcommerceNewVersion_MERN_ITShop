const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv").config();
const capitalizeFirstLetter = require("./capitalizeFirstLetter");
const URI = process.env.DB_URI;
console.log(URI);
const dbConnect = () => {
  mongoose
    .connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB <3"))
    .catch((err) =>
      console.log(
        "MongoDB's Connection failed!" +
          "\n" +
          capitalizeFirstLetter(err.message)
      )
    );
};

module.exports = dbConnect;
