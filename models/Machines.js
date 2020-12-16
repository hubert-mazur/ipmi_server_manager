const { number, boolean, bool } = require("joi");
const mongoose = require("mongoose");

const MachineSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 4,
    max: 30,
  },
  IP: {
    type: String,
    max: 15,
  },
  port: {
    type: String,
    default: 623,
  },

  user: {
    type: String,
  },

  password: {
    type: String,
  },
  assigned: {
    type: Boolean,
  },
});

module.exports = mongoose.model("Machine", MachineSchema);
