const express = require("express");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const midtransClient = require("midtrans-client");
const { sendMail, sendNotification } = require("../helper");
const router = express.Router();

// @route        GET /order/
// @desc         List Order
// @access       private (admin / host)
router.get("/", async (req, res) => {
  const order = await Order.find().populate("property guest");
  res.send(order);
});

// @route        GET /order/
// @desc         List Order
// @access       public (admin / host)
router.get("/host/booking", async (req, res) => {
  if (req.user.role === "host") {
    await Order.find({})
      .populate("guest")
      .populate({
        path: "property",
        match: { host: { $in: req.user._id } }
      })
      .exec((err, item) => {
        items = item.filter(function(doc) {
          return doc.property != null;
        });
        res.send(items);
      });
  } else {
    const order = await Order.find().populate("property guest");
    res.send(order);
  }
});

// @route        GET /order/
// @desc         List Order
// @access       private (admin / host)
router.get("/single/user", async (req, res) => {
  const order = await Order.find({ guest: req.user._id }).populate(
    "property guest"
  );
  res.send(order);
});

// @route        GET /order/
// @desc         List Order
// @access       private (admin / host)
router.get("/:id", async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id }).populate(
    "property guest"
  );
  res.send(order);
});

// @route        POST /order/
// @desc         ADD Order
// @access       private (admin / host)
router.post("/", async (req, res) => {
  const data = req.body;
  console.log(data);
  try {
    if (!data.guest) {
      return res.send("error");
    }
    const order = new Order(data);
    const token = await User.findOne({ _id: data.guest });
    await order.save();
    await sendMail(order);
    await sendNotification(
      token.notification,
      `Order ${order._id} Received`,
      "Thank you for your order, please compleet the payment"
    );
    res.send(order);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error ");
  }
});

// @route        GET /order/token
// @desc         ADD Order
// @access       private (admin / host)
router.get("/get/token", (req, res) => {
  let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: "SB-Mid-server-avadaU6xl-9YhNg_dASAPCQW",
    clientKey: "SB-Mid-client-GNV7FN8RaJuzyoEG"
  });

  let parameter = {
    transaction_details: {
      order_id: req.query.id,
      gross_amount: req.query.amount
    },
    credit_card: {
      secure: true
    }
  };

  snap.createTransaction(parameter).then(transaction => {
    const token = transaction.token;
    const redirect = transaction.redirect_url;
    res.send({ token, redirect });
  });
});

// @route        POST /order/token
// @desc         ADD Order
// @access       private (admin / host)
router.post("/transaction", async (req, res) => {
  const { transaction_status, order_id } = req.body;
  const order = await Order.findOne({ _id: order_id }).populate(
    "property guest"
  );
  if (transaction_status === "capture" || transaction_status === "settlement") {
    await OrderModel.findByIdAndUpdate(
      { _id: order_id },
      { $set: { status: "PAID" } }
    );
    if (order) {
      const token = order.host.notification;
      await sendMail(order);
      await sendNotification(
        token,
        "You received new Order",
        "lorem ipsum dolor)"
      );
    }
  }
});

module.exports = router;
