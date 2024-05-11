const axios = require("axios");
const currency = require("currency.js");
const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: "rzp_test_GsAG7MjFVzi7GN",
  key_secret: "Rnoplm304qpexKd7iqJkOyLn",
});

const checkout = async (req, res) => {
  const { amount } = req.body; // VND
  let amountUSD = 0;
  try {
    const response = await axios.get(
      "https://cdn.moneyconvert.net/api/latest.json"
    );
    if (response?.data) {
      let exchangeRate = 1 / response.data.rates.VND;
      amountUSD = currency(amount, { symbol: "đ", precision: 0 }).multiply(
        exchangeRate
      );
    }
  } catch (error) {
    throw new Error(error);
  }
  const option = {
    amount: amountUSD.value !== 0 ? amountUSD.value * 100 : amount * 100,
    currency: "INR", // INR
  };

  const order = await instance.orders.create(option);
  res.json({
    success: true,
    order,
  });
};
const paymentVerification = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId } = req.body;
  res.json({
    razorpayOrderId,
    razorpayPaymentId,
  });
};

module.exports = {
  checkout,
  paymentVerification,
};
