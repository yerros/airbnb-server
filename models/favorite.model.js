const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema({
  create_at: {
    type: Date,
    default: Date.now
  },
  property: {
    type: mongoose.Types.ObjectId,
    ref: "Property"
  },
  guest: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Favorite", favoriteSchema);
