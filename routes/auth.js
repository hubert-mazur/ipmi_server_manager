const { response } = require("express");

const router = require("express").Router();
const User = require("../models/User");
const Joi = require("joi");

// Validation schema
validationSchema = Joi.object({
  name: Joi.string().max(25).required(),
  lastName: Joi.string().max(25).required(),
  email: Joi.string().required().max(64).email(),
  password: Joi.string().required().max(2048).min(6),
});

router.post("/register", async (request, response) => {
    // Data validation
    // const {error} = Joi.validate(request.body, validationSchema);
    const {error} = validationSchema.validate(request.body)
    if (error) {
        response.status(400).send(error)
    }
    const user = new User({
    name: request.body.name,
    lastName: request.body.lastName,
    email: request.body.email,
    password: request.body.password,
  });

  try {
    const savedUserData = await user.save();
    response.send(savedUserData);
  } catch (err) {
    response.status(400).send(err);
  }
});
router.post("/login", (request, response) => {
  response.send("Login");
});

module.exports = router;
