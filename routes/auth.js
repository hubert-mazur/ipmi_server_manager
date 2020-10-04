const { response } = require("express");
const router = require("express").Router();
const User = require("../models/User");
const validationSchemas = require('../validationSchemas');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post("/register", async (request, response) => {
    const {error} = validationSchemas.registerValidation(request.body);
    if (error) {
        response.status(400).send(error)
    }

    // user already in DB ?
    const emailExists = await User.findOne({email: request.body.email})
    if (emailExists) {
      return response.status(400).send( {message: 'Email is already in Database'})
    }

    // Password hashing
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(request.body.password, salt);

    const user = new User({
    name: request.body.name,
    lastName: request.body.lastName,
    email: request.body.email,
    password: hashedPassword,
  });

  try {
    const savedUserData = await user.save();
    response.send({user: savedUserData._id});
  } catch (err) {
    response.status(400).send(err);
  }
});


router.post("/login", async (request, response) => {
  
  const {error} = validationSchemas.loginValifation(request.body);
  if (error) {
      response.status(400).send(error)
  }
  
  const user = await User.findOne({email: request.body.email})
  if (!user) {
    return response.status(400).send( {message: 'Wrong email or password '})
  }

  const isPassValid = await bcrypt.compare(request.body.password, user.password)
  if (!isPassValid) {
    return response.status(400).send({message: "Wrong email or password"})
  } 

  const token = jwt.sign({_id: user._id}, process.env.SECRET_TOKEN);
  response.header('auth-token', token).send(token);
});

module.exports = router;
