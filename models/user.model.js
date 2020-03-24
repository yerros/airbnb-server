const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  authyId: String,
  phone: String,
  role: {
    type: String,
    enum: ["admin", "host", "guest"],
    default: "guest"
  },
  token: String,
  property: {
    type: mongoose.Types.ObjectId,
    ref: "Property"
  }
});

module.exports = mongoose.model("User", UserSchema);
