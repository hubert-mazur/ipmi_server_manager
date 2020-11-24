const { response } = require("express");
const router = require("express").Router();
const User = require("../models/User");
const validationSchemas = require('../validationSchemas/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post("/", async (request, response) => {
  
  const {error} = validationSchemas.loginValidation(request.body);
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

  const token = jwt.sign({_id: user._id}, process.env.SECRET_TOKEN, {expiresIn: '2h'});
  response.header('auth-token', token).send(token);
});

module.exports = router;
