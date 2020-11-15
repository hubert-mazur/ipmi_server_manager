const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 2,
        max: 30
    },

    users: {
        type: Array,
        default: []
    },

    machines: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model("Group", groupSchema);