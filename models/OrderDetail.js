const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var orderDetailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  shippingInfo: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: false,
    },
    address: {
      type: String,
      required: true,
    },
    other: {
      type: String,
      required: false,
    },
    pincode: {
      type: String,
      required: false,
    },
    province: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    commune: {
      type: String,
      required: true,
    },
  },
  paymentInfo: {
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      required: true,
    },
    payOSOrderId: {
      type: String,
      required: false,
    },
    payOSPaymentId: {
      type: String,
      required: false,
    },
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      color: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  paidAt: {
    type: Date,
    default: Date.now(),
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  totalPriceAfterDiscount: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    default: "Ordered",
  },
});

//Export the model
module.exports = mongoose.model("OrderDetail", orderDetailSchema);
