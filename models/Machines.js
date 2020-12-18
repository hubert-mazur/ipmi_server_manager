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
  scriptUsage: {
    type: Boolean,
    default: false,
  },
  script: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Machine", MachineSchema);
