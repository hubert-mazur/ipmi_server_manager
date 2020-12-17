const { request, response } = require("express");
const { expression } = require("joi");
const router = require("express").Router();
const auth = require("../verifyToken");
const validation = require("../validationSchemas/user");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const e = require("express");
const admin = require("../admins");
const { verify } = require("jsonwebtoken");
const verifyAdmin = require("../verifyUser");
const Machine = require("../models/Machines");
const errLog = require("../errorLog");

// add a new user to database
router.post("/", auth, verifyAdmin, async (request, response) => {
  //validate user data
  const err = await validation.registerValidation(request.body);

  if (err.error) {
    errLog(err, request._id);
    return response.status(400).send({
      error: true,
      meta: "validationError",
      body: err.error.details[0].message,
    });
  }

  // check if user is not already in DB
  const userExists = await User.findOne({ email: request.body.email });
  if (userExists)
    return response.status(400).send({
      error: true,
      meta: "",
      body: `User ${request.body.email} is already in database!`,
    });

  //hash password

  const salt = await bcrypt.genSalt();
  const hashedPass = await bcrypt.hash(request.body.password, salt);

  const user = new User({
    name: request.body.name,
    lastName: request.body.lastName,
    email: request.body.email,
    password: hashedPass,
    isAdmin: request.body.admin,
  });

  try {
    const savedUser = await user.save();
    response.status(200).send({ error: false, meta: "", body: savedUser._id });
  } catch (err) {
    errLog(err, request._id);
    return response.status(400).send({ error: true, meta: "", body: err });
  }
});

// delete user with given _id
router.delete("/:user_id", auth, async (request, response) => {
  if (!admin(request._id) && request.params.user_id != request._id) {
    return response.status(404).send({
      error: true,
      meta: "",
      body: "You are not allowed to delete other users",
    });
  }

  try {
    const Machines = await User.findById(request.params.user_id).select(
      "-_id machines"
    );
    console.error(Machines);

    for (let i = 0; i < Machines.machines.length; i++) {
      const exists = await User.find({
        machines: { $in: [Machines.machines[i]] },
      });
      console.error(`Assignment count: ${exists.length - 1}`);
      if (exists.length - 1 == 0) {
        await Machine.findByIdAndUpdate(
          { _id: Machines.machines[i] },
          { assigned: false }
        );
      }
    }

    await User.findByIdAndRemove({ _id: request.params.user_id });
    return response.status(200).send({ error: false, meta: "", body: "OK" });
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "", body: err });
  }
});

// get all users in DB
router.get("/", auth, async (request, response) => {
  selection = {};
  const isAdmin = await admin(request._id);

  if (!isAdmin) {
    selection = { _id: request._id };
  }

  const users = await User.find(selection).select("-password");

  if (!users) {
    return response
      .status(400)
      .response({ error: true, meta: "", body: users });
  }

  return response.status(200).send({ error: false, meta: "", body: users });
});

router.get("/identity", auth, async (request, response) => {
  const selection = { _id: request._id };

  const users = await User.find(selection).select("-password");

  if (!users) {
    return response
      .status(400)
      .response({ error: true, meta: "", body: users });
  }

  return response.status(200).send({ error: false, meta: "", body: users });
});

router.patch("/:user_id/name", auth, async (request, response) => {
  if (!admin(request._id) && request._id != request.params.user_id) {
    return response.status(401).send({ message: "You are not admin" });
  }

  const user = User.findOneAndUpdate(
    { _id: request.params.user_id },
    { name: request.body.name },
    (err) => {
      if (err) {
        errLog(err, request._id);
        return response.status(400).send({ error: true, meta: "", body: err });
      } else
        return response
          .status(200)
          .send({ error: false, meta: "OK", body: "" });
    }
  );
  return user;
});

router.patch("/:user_id/email", auth, async (request, response) => {
  if (!admin(request._id) && request._id != request.params.user_id) {
    return response.status(401).send({ message: "You are not admin" });
  }

  const user = User.findOneAndUpdate(
    { _id: request.params.user_id },
    { email: request.body.email },
    (err) => {
      if (err) {
        errLog(err, request._id);
        return response.status(400).send({ error: true, meta: "", body: err });
      } else
        return response
          .status(200)
          .send({ error: false, meta: "OK", body: "" });
    }
  );
  return user;
});

router.patch("/:user_id/lastName", auth, async (request, response) => {
  if (!admin(request._id) && request._id != request.params.user_id) {
    return response.status(401).send({ message: "You are not admin" });
  }

  const user = User.findOneAndUpdate(
    { _id: request.params.user_id },
    { lastName: request.body.lastName },
    (err) => {
      if (err) {
        errLog(err, request._id);
        return response.status(400).send({ error: true, meta: "", body: err });
      } else
        return response
          .status(200)
          .send({ error: false, meta: "OK", body: "" });
    }
  );
  return user;
});

router.patch("/:user_id/password", auth, async (request, response) => {
  if (!admin(request._id) && request._id != request.params.user_id) {
    return response.status(401).send({ message: "You are not admin" });
  }
  const user = User.findOne({ _id: request.params.user_id });
  if (!user) return response.status(400).send({ message: "user not found" });
  const isAdmin = await admin(request._id);
  if (! isAdmin) {
    compareStatus = await bcrypt.compare(
      request.body.oldPassword,
      (await user).password
    );

    if (!compareStatus)
      return response.status(400).send({ message: "Password mismatch" });
  }

  const salt = await bcrypt.genSalt();
  const hashedPass = await bcrypt.hash(request.body.password, salt);

  user.update({ password: hashedPass }, (err, docs) => {
    if (err) {
      errLog(err, request._id);
      return response.status(400).send({ error: true, meta: "", body: err });
    } else
      return response.status(200).send({ error: false, meta: "OK", body: "" });
  });
});

router.put(
  "/:user_id/machines/",
  auth,
  verifyAdmin,
  async (request, response) => {
    const machineExists = await Machine.exists({
      _id: request.body.machine_id,
    });

    if (!machineExists) {
      return response
        .status(400)
        .send({ error: true, meta: "", body: "No such machine exists" });
    }

    const updated = await User.findOneAndUpdate(
      { _id: request.params.user_id },
      { $addToSet: { machines: request.body.machine_id } },
      (err, docs) => {
        if (err) {
          errLog(err, request._id);
          return response
            .status(400)
            .send({ error: true, meta: "", body: err });
        } else {
          return response
            .status(200)
            .send({ error: false, meta: "OK", body: "" });
        }
      }
    );

    try {
      await Machine.findOneAndUpdate(
        { _id: request.body.machine_id },
        { assigned: true }
      );
    } catch (err) {
      return reponse.status(400).send({ error: true, meta: "", body: err });
    }

    return updated;
  }
);

router.delete(
  "/:user_id/machines/:machine_id",
  auth,
  verifyAdmin,
  async (request, response) => {
    const deleted = User.findOneAndUpdate(
      { _id: request.params.user_id },
      { $pull: { machines: request.params.machine_id } },
      (err, docs) => {
        if (err) {
          errLog(err, request._id);
          return response
            .status(400)
            .send({ error: true, meta: "", body: err });
        } else {
          return response
            .status(200)
            .send({ error: false, meta: "OK", body: "" });
        }
      }
    );

    try {
      const exists = await User.find({
        machines: { $in: [request.params.machine_id] },
      });

      if (exists.length == 0) {
        await Machine.findByIdAndUpdate(
          { _id: request.params.machine_id },
          { assigned: false }
        );
      }
    } catch (err) {
      return response.status(400).send({ error: true, meta: "", body: err });
    }
    return deleted;
  }
);

module.exports = router;
