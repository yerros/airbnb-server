const express = require("express");
const passport = require("passport");
const Property = require("../models/properties.model");
const Category = require("../models/category.model");
const User = require("../models/user.model");
const { isHost } = require("../middlewares");
const requireAuth = passport.authenticate("jwt", { session: false });
const router = express.Router();

// @route        GET /property/
// @desc         List Property
// @access       public
router.get("/", async (req, res) => {
  const property = await Property.find().populate({
    path: "host category",
    select: [
      "firstname",
      "lastname",
      "email",
      "category_name",
      "category_description"
    ]
  });
  res.send(property);
});

// @route        GET /property/
// @desc         List Property
// @access       public
router.get("/search/query", async (req, res) => {
  const { q, category, price } = req.query;
  let property = await Property.find().populate({
    path: "category",
    select: ["category_name", "category_description"]
  });
  if (q) {
    property = await Property.find({ $text: { $search: q } }).populate({
      path: "category",
      select: ["category_name", "category_description"]
    });
    return res.send(property);
  }
  if (category) {
    property = await Property.find({ category: category }).populate({
      path: "category",
      select: ["category_name", "category_description"]
    });
    return res.send(property);
  }
  if (price) {
    property = await Property.find({
      price: { $lte: price, $gte: 0 }
    }).populate({
      path: "category",
      select: ["category_name", "category_description"]
    });
    return res.send(property);
  }
  res.send(property);
});

// @route        GET /property/:id
// @desc         SingleList Property
// @access       public
router.get("/:id", async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id }).populate({
    path: "category",
    select: ["category_name", "category_description"]
  });
  res.send(property);
});

// @route        GET /property/
// @desc         List Property
// @access       private(admin / host)
router.get("/single/user", requireAuth, isHost, async (req, res) => {
  if (req.user.role === "host") {
    const property = await Property.find({ host: req.user._id }).populate({
      path: "host category",
      select: [
        "firstname",
        "lastname",
        "email",
        "category_name",
        "category_description"
      ]
    });
    return res.send(property);
  } else {
    const property = await Property.find().populate({
      path: "host category",
      select: [
        "firstname",
        "lastname",
        "email",
        "category_name",
        "category_description"
      ]
    });
    return res.send(property);
  }
});

// @route        POST /property/
// @desc         Add Property
// @access       private(admin / host)
router.post("/", requireAuth, isHost, async (req, res) => {
  const data = req.body;
  try {
    if (data) {
      const property = new Property(data);
      await property.save();
      await Category.findByIdAndUpdate(
        { _id: property.category },
        { $push: { property: property._id } }
      );
      await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $push: { property: property._id } }
      );
      res.send(property);
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// @route        PUT /property/
// @desc         Edit Property
// @access       private(admin / host)
router.put("/:id", requireAuth, isHost, async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    if (data) {
      let property = await Property.findOneAndUpdate(
        { _id: id },
        { $set: data }
      );
      res.send(property);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route        DELETE /property/
// @desc         Delete Property
// @access       private (admin only)
router.delete("/:id", requireAuth, isHost, async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete({
      _id: req.params.id
    });
    if (!deleted) {
      return res.status(404).json({
        message: "property not found"
      });
    }
    res.status(200).json({
      msg: "Delete Success"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error 2");
  }
});
module.exports = router;
