const { boolean } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    max: 25,
  },
  lastName: {
    type: String,
    required: true,
    max: 25,
  },
  email: {
    type: String,
    required: true,
    max: 64,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 2048,
  },
  machines: {
    type: Array,
    required: true,
    default: []
  },

  isAdmin: {
    type: Boolean,
    default: false
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
