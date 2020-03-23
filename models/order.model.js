const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  create_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "unpaid"
  },
  guest: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  property: {
    type: mongoose.Types.ObjectId,
    ref: "Property"
  },
  amount: {
    type: Number
  },
  payment_method: {
    type: String
  },
  booking_date: {
    type: Object
  },
  billing: {
    type: Object
  }
});

module.exports = mongoose.model("Order", orderSchema);
