const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const OrderModel = require("../models/order.model");
const passport = require("../config/passport");

// facebook routes
router.get("/facebook", passport.authenticate("facebook", { scope: "email" }));
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    const user = req.user;
    res.redirect(`http://localhost:3000?token=${user.token}`);
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
    res.redirect(`http://localhost:3000?token=${user.token}`);
  }
);

const requireAuth = passport.authenticate("jwt", { session: false });
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
  if (transaction_status === "capture" || transaction_status === "settlement") {
    await OrderModel.findByIdAndUpdate(
      { _id: order_id },
      { $set: { status: "paid" } }
    );
  }
});

module.exports = router;
