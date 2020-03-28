const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const OrderModel = require("../models/order.model");
const passport = require("../config/passport");
const config = require("../config/oauth");
const {
  setUser,
  generateToken,
  sendMail,
  sendNotification
} = require("../helper");
const requireAuth = passport.authenticate("jwt", { session: false });
const authy = require("authy")(config.Authy.key);

router.get("/tes", async (req, res) => {
  const order = await OrderModel.findOne({
    _id: "5e7e5d039dd46f0017b511ff"
  }).populate("property guest host");

  const host = await User.findOne({ _id: order.property.host });

  const userToken = order.guest.notification;
  const hostToken = host.notification;
  await sendNotification(
    hostToken,
    "You received new order",
    "Congratulations"
  );
  await sendNotification(
    userToken,
    "You payment has been received",
    "Congratulations"
  );
  res.send({ userToken, hostToken });
});
//subcribe notification
router.post("/subscribe", requireAuth, async (req, res) => {
  const subscription = req.body;
  console.log(subscription);
  const token = await User.findOne({ _id: req.user._id });
  if (
    !token.notification ||
    token.notification.endpoint !== subscription.endpoint
  ) {
    console.log("not");
    const user = await User.findOne({ _id: req.user._id });
    const newUser = { user, notification: subscription };
    await User.findByIdAndUpdate(req.user._id, newUser).catch(err =>
      console.log(err)
    );
  }
  res.status(201).json({ status: "subscription success" });
});
//

// facebook routes
router.get("/facebook", passport.authenticate("facebook", { scope: "email" }));
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    const user = req.user;
    res.redirect(`${process.env.frontend}?token=${user.token}`);
  }
);

// google routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user;
    res.redirect(`${process.env.frontend}?token=${user.token}`);
  }
);

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;
  console.log(phone);
  let user = await User.findOne({ email: email });
  let phones = await User.findOne({ phone: phone });
  if (user) {
    return res.send({ data: "Email already used", status: "error" });
  }
  if (phones) {
    return res.send({ data: "Phone Number already used", status: "error" });
  }
  authy.register_user(email, phone, "+62", async (err, auth) => {
    if (err) throw err;
    user = new User({
      firstname,
      lastname,
      email,
      phone,
      authyId: auth.user.id
    });
    await user.save();
    const token = generateToken(setUser(user));
    const userToken = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { token: token } }
    );
    res.send({
      data: "Registration Success ! you can login now",
      status: "success"
    });
  });

  //res.send(user);
});

router.post("/otp", async (req, res) => {
  if (req.body.phone) {
    const user = await User.findOne({ phone: req.body.phone });
    if (!user) {
      return res.send({ success: false, message: "Phone number not found" });
    }
    authy.request_sms(user.authyId, (force = true), function(err, response) {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: "To many request try again leter"
        });
      }
      res.send({ success: true, message: response.message, id: user.authyId });
    });
  }
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  const { authyId, token } = req.body;
  if (token) {
    authy.verify(authyId, token, async (err, response) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: "Token not valid"
        });
      }
      let user = await User.findOne({ authyId: authyId });
      res.send(`${process.env.frontend}?token=${user.token}`);
    });
  }
});

router.get("/user", requireAuth, (req, res) => {
  res.send(req.user);
});

router.put("/user/:id", requireAuth, async (req, res) => {
  const data = req.body;
  const user = await User.findOneAndUpdate(
    { _id: req.params.id },
    { $set: data }
  );
  res.send(user);
});

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
      const host = await User.findOne({ _id: order.property.host });

      const userToken = order.guest.notification;
      const hostToken = host.notification;
      await sendNotification(
        hostToken,
        "You received new order",
        "Congratulations"
      );
      await sendNotification(
        userToken,
        "You payment has been received",
        "Congratulations"
      );

      await sendMail(order);
    }
  }
});

module.exports = router;
