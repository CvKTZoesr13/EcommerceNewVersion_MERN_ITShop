const express = require("express");
const dbConnect = require("./config/dbConnect");
const { redisConnect } = require("./config/redisConnect");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 5000;
const authRouter = require("./routes/AuthRoute");
const productRouter = require("./routes/ProductRoute");
const blogRouter = require("./routes/BlogRoute");
const categoryRouter = require("./routes/ProdCategoryRoute");
const blogCategoryRouter = require("./routes/BlogCategoryRoute");
const brandRouter = require("./routes/BrandRoute");
const colorRouter = require("./routes/ColorRoute");
const couponRouter = require("./routes/CouponRoute");
const enquiryRouter = require("./routes/EnquiryRoute");
const uploadRouter = require("./routes/UploadRoute");
const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const redisClient = require("./config/redisClient");
dbConnect();
redisConnect();
// Cross-Origin Resource Sharing
app.use(cors());

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blog_category", blogCategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/color", colorRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/enquiry", enquiryRouter);
app.use("/api/upload", uploadRouter);

app.use(notFound);
app.use(errorHandler);

// connecting to redis whenever the server is started
redisClient.connect().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Server is running on port ${PORT}.\nCtr + Click to see what happen in http://localhost:${PORT}`
    );
  });
});
