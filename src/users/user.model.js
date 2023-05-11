const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    username: { type: String, unique: true },
    password: { type: String },
    refreshToken: { type: String, default: "" },

  },
  { timestamps: true }
);
module.exports = mongoose.model("user", User);
