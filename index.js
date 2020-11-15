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
const apiRoute = require('./routes/landing_page');
const userRoute = require('./routes/user_management');
const groupRoute = require('./routes/group');

// Middlewares
app.use(express.json());    

// Routes middlewares

app.use('/api/login', authRoute);
app.use('/api/landing', apiRoute);
app.use('/api/user', userRoute);
app.use('/api/group', groupRoute);


app.listen(3000, () => {
    console.log('Server started')
});
