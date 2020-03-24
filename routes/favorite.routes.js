const express = require("express");
const Favorite = require("../models/favorite.model");

const router = express.Router();

router.get("/", async (req, res) => {
  const auth = req.user._id;
  const favorite = await Favorite.find({ guest: auth }).populate(
    "property guest"
  );
  res.send(favorite);
});

router.post("/", async (req, res) => {
  const guest = req.user._id;
  const property = req.body.property;
  let favorite = await Favorite.findOne({
    property: req.body.property,
    guest: guest
  });
  if (!favorite) {
    const newfavorite = new Favorite({ property, guest });
    await newfavorite.save();
    return res.send("Success add to your favorite lists");
  }
  res.send("Already on your favorite lists");
});

// @route        DELETE /category/
// @desc         Delete Category
// @access       private (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Favorite.findByIdAndDelete({
      _id: req.params.id
    });
    if (!deleted) {
      return res.status(404).json({
        message: "category not found"
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
