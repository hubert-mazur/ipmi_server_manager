const { request, response } = require("express");
const { expression } = require("joi");
const router = require("express").Router();
const auth = require("../verifyToken");
const validation = require("../validationSchemas/user");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const e = require("express");
const admin = require("../admins");

// add a new user to database

router.post("/", auth, async (request, response) => {
  // check if user is Admin
  if (!admin(request._id)) {
    return response
      .status(401)
      .send({ message: "You are not allowed to create users" });
  }

  //validate user data
  const { error } = validation.registerValidation(request.body);

  if (error) {
    response.status(400).send(error);
  }

  // check if user is not already in DB
  const userExists = await User.findOne({ email: request.body.email });
  if (userExists)
    return response
      .status(400)
      .send({ message: `User ${request.body.email} is already in database!` });

  //hash password

  const salt = await bcrypt.genSalt();
  const hashedPass = await bcrypt.hash(request.body.password, salt);

  const user = new User({
    name: request.body.name,
    lastName: request.body.lastName,
    email: request.body.email,
    password: hashedPass,
  });

  try {
    const savedUser = await user.save();
    response.status(200).send({ user: savedUser._id });
  } catch (error) {
    response.status(400).send(error);
  }
});

// delete user with given _id
router.delete("/:id", auth, async (request, response) => {
  if (!admin(request._id) && request.params.id != request._id) {
    return response
      .status(401)
      .send({ message: "You are not allowed to delete other users" });
  }

  const deleted = User.deleteOne({ _id: request.params.id }, function (err) {
    if (err) {
      return response.status(400).send(err);
    }
  });

  return response
    .status(200)
    .send({ _id: request.params.id, count: (await deleted).deletedCount });
});

// get all users in DB
router.get("/", auth, async (request, response) => {
  selection = {};

  if (!admin(request._id)) {
    selection = { _id: request._id };
  }

  const users = await User.find().select("-password");

  if (!users) {
    return response.status(400).response(users);
  }

  return response.status(200).send(users);
});

router.patch("/:id/name", auth, async (request, response) => {
  if (!admin(request._id) && request._id != request.params.id) {
    return response.status(401).send({ message: "You are not admin" });
  }

  const user = User.findOneAndUpdate(
    { _id: request.params.id },
    { name: request.body.name },
    (err) => {
      if (err) return response.status(400).send(err);
    }
  );

  return response.status(200).send({ message: "updated" });
});

router.patch("/:id/email", auth, async (request, response) => {
  if (!admin(request._id) && request._id != request.params.id) {
    return response.status(401).send({ message: "You are not admin" });
  }

  const user = User.findOneAndUpdate(
    { _id: request.params.id },
    { email: request.body.email },
    (err) => {
      if (err) return response.status(400).send(err);
    }
  );

  return response.status(200).send({ message: "updated" });
});

router.patch("/:id/lastName", auth, async (request, response) => {
  if (!admin(request._id) && request._id != request.params.id) {
    return response.status(401).send({ message: "You are not admin" });
  }

  const user = User.findOneAndUpdate(
    { _id: request.params.id },
    { lastName: request.body.lastName },
    (err) => {
      if (err) return response.status(400).send(err);
    }
  );

  return response.status(200).send({ message: "updated" });
});

router.patch("/:id/password", auth, async (request, response) => {
  if (!admin(request._id) && request._id != request.params.id) {
    return response.status(401).send({ message: "You are not admin" });
  }

  const user = User.findOne({ _id: request.params.id });
  if (!user) return response.status(400).send({ message: "user not found" });
  compareStatus = await bcrypt.compare(
    request.body.oldPassword,
    (await user).password
  );

  if (!compareStatus)
    return response.status(400).send({ message: "Password mismatch" });

  const salt = await bcrypt.genSalt();
  const hashedPass = await bcrypt.hash(request.body.password, salt);

  user.update({ password: hashedPass }, (err) => {
    if (err) return response.status(400).send(err);
  });

  return response.status(200).send({ message: "updated" });
});

module.exports = router;
