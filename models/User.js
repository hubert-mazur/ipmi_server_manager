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

  isAdmin: {
    type: Boolean,
    default: false
  },

  groups: {
    type: Array,
    default: []
  },

  machines: {
    type: Array,
    default: []
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
