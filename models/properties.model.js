const mongoose = require("mongoose");

const PropertySchema = mongoose.Schema({
  title: String,
  description: String,
  category: {
    type: mongoose.Types.ObjectId,
    ref: "Category"
  },
  price: Number,
  large: Number,
  room: Number,
  bed: Number,
  images: String,
  address: String,
  maps: Object,
  host: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Property", PropertySchema);
