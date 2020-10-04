const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        max: 25
    },
    lastName: {
      type: String,
      required: true,
      max: 25 
    },
    email: {
        type: String,
        required: true,
        max: 64,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 2048
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);