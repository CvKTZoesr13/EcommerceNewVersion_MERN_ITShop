const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 5000;
const authRouter = require("./routes/AuthRoute");
const productRouter = require("./routes/ProductRoute");
const blogRouter = require("./routes/BlogRoute");
const categoryRouter = require("./routes/ProdCategoryRoute");
const blogCategoryRouter = require("./routes/BlogCategoryRoute");
const brandRouter = require("./routes/BrandRoute");
const couponRouter = require("./routes/CouponRoute");
const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
dbConnect();

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
app.use("/api/coupon", couponRouter);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}.\nCtr + Click to see what happen in http://localhost:${PORT}`
  );
});
