const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: String
}, {timestamps: true});

module.exports = mongoose.model("User", UserSchema);