const express = require("express");
const Category = require("../models/category.model");
const { isHost, isAdmin } = require("../middlewares");
const router = express.Router();

// @route        GET /category/
// @desc         List Category
// @access       private (admin / host)
router.get("/", isHost, async (req, res) => {
  try {
    const category = await Category.find();
    res.send(category);
  } catch (error) {
    res.status(500).json({
      message: "Something error found on category"
    });
  }
});

// @route        POST /category/
// @desc         Add new Category
// @access       private (admin only)
router.post("/", isAdmin, async (req, res) => {
  const { category_name, category_description } = req.body;
  try {
    let category = await Category.findOne({ category_name });
    if (category) {
      return res.status(400).json({
        message: "Category already exist"
      });
    }

    category = new Category({
      category_name,
      category_description
    });
    await category.save();
    res.send(category);
  } catch (error) {
    res.status(500).json({
      message: "Something error found on category"
    });
  }
});

// @route        PUT /category/
// @desc         Update Category
// @access       private (admin only)
router.put("/:id", isAdmin, async (req, res) => {
  const { category_name, category_description } = req.body;
  try {
    const update = await Category.findOneAndUpdate(
      {
        _id: req.params.id
      },
      {
        $set: {
          category_name: category_name,
          category_description: category_description
        }
      }
    );
    res.status(200).json({
      message: "Update Success",
      result: update
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error 2");
  }
});

// @route        DELETE /category/
// @desc         Delete Category
// @access       private (admin only)
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete({
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
