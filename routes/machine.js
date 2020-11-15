const express = require("express");
const router = require("express").Router();
const Machine = require("../models/Machines");
const auth = require("../verifyToken");
const admin = require("../admins");
const validation = require("../validationSchemas/machine");
const { request, response } = require("express");
const Group = require("../models/Group");

router.post("/", auth, async (request, response) => {
  if (!admin(request._id)) {
    return response
      .status(401)
      .send({ message: "You are not allowed to add machines" });
  }

  const { validationStatus } = validation(request.body);

  if (validationStatus) {
    return response.status(401).send(validationStatus);
  }

  const machine = new Machine({
    name: request.body.name,
    IP: request.body.IP,
    user: request.body.user,
    password: request.body.password,
  });

  try {
    const savedMachine = await machine.save();
    response.status(200).send({ _id: savedMachine._id });
  } catch (err) {
    response.status(400).send(err);
  }
});

router.get("/", auth, async (request, response) => {
  if (admin(request._id)) {
    const machines = await Machine.find((err, docs) => {
      if (err) {
        return response.status(400).send(err);
      }
    });
    if (machines) {
      return response.status(200).send(machines);
    }
  } else {
    const machines = await Group.find({users: {$contains: request._id}}, (err, docs) => {
        return err;
    }).select("machines, -_id");

    if (!machines){
        return response.status(400).send(machines);
    }

    return response.status(200).send(machines);

  }
});

module.exports = router;
