const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 2,
        max: 30
    },

    machines: {
        type: Array
    }
});

module.exports = mongoose.model("Group", groupSchema);