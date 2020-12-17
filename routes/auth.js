const { response } = require("express");
const router = require("express").Router();
const User = require("../models/User");
const validationSchemas = require("../validationSchemas/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/", async (request, response) => {
  const err = await validationSchemas.loginValidation(request.body);
  if (err.error) {
    return response
      .status(400)
      .send({ error: true, meta: "validation", body: err.error.details[0].message });
  }

  const user = await User.findOne({ email: request.body.email });
  if (!user) {
    return response
      .status(400)
      .send({ error: true, meta: "app", body: "Wrong email or password" });
  }

  const isPassValid = await bcrypt.compare(
    request.body.password,
    user.password
  );
  if (!isPassValid) {
    return response
      .status(400)
      .send({ error: true, meta: "app", body: "Wrong email or password" });
  }

  const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN, {
    expiresIn: "2h",
  });
  return response.header("auth-token", token).status(200).send(token);
});

module.exports = router;
