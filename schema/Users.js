require("dotenv").config();
const mongoose = require("mongoose");
const PLM = require("passport-local-mongoose");
const userModel = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userModel.plugin(PLM);

module.exports = mongoose.model("UserCollection", userModel);
