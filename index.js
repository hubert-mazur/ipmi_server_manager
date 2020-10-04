const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Database connection
dotenv.config();

mongoose.connect(process.env.DB_CONNECT,{ useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log('Connected to DB');
})

// Routes
const authRoute = require('./routes/auth');


// Middlewares
app.use(express.json());    

// Routes middlewares

app.use('/api/user', authRoute);




app.listen(3000, () => {
    console.log('Server started')
});
