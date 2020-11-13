const mongoose = require("mongoose");

const MachineSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 4,
        max: 30
    },
    IP: {
        type: String,
        max: 15
    },

    user: {
        type: String
    },

    password: {
        type: String
    }
});


module.exports = mongoose.model("Machine", MachineSchema);