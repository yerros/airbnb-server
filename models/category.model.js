const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: true,
    unique: true
  },
  category_description: {
    type: String
  },
  property: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property"
    }
  ]
});

module.exports = mongoose.model("Category", CategorySchema);
