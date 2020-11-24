const express = require("express");
const router = require("express").Router();
const Machine = require("../models/Machines");
const auth = require("../verifyToken");
const admin = require("../admins");
const validation = require("../validationSchemas/machine");
const { request, response } = require("express");
const Group = require("../models/Group");
const User = require("../models/User");
const verifyAdmin = require("../verifyUser");

router.post("/", auth, verifyAdmin, async (request, response) => {
  const { validationStatus } = validation(request.body);

  if (validationStatus) {
    return response.status(400).send(validationStatus);
  }

  const machine = new Machine({
    name: request.body.name,
    IP: request.body.IP,
    user: request.body.user,
    password: request.body.password,
  });

  const savedMachine = await machine.save((err, docs) => {
    if (err) {
      return response.status(400).send(err);
    } else {
      return response.status(200).send({ _id: docs._id });
    }
  });
});

router.get("/", auth, async (request, response) => {
  const isAdmin = await admin(request._id);
  if (isAdmin) {
    const machines = await Machine.find((err, docs) => {
      if (err) {
        return response.status(400).send(err);
      }
    });
    if (machines) {
      return response.status(200).send(machines);
    }
  } else {
    const user = await User.findOne({ _id: request._id }, (err, docs) => {
      if (err) {
        return response.status(400).send({ message: err });
      } else if (!docs) {
        return response
          .status(400)
          .send({ message: "No user with given _id exists" });
      }
    });

    if (!user) {
      return user;
    }

    const machines = await Machine.find({ _id: user.machines }, (err, docs) => {
      return err;
    });

    if (!machines) {
      return response.status(400).send(machines);
    }

    return response.status(200).send(machines);
  }
});

router.delete("/:machine_id", auth, verifyAdmin, async (request, response) => {
  const updated = User.updateMany(
    { machines: { "$in": [request.params.machine_id] } },
    { $pull: { machines: request.params.machine_id} }, (err, raw)=> {
      if (err) {
        console.error(err);
      }
    }
  );

  const deleted = await Machine.deleteOne(
    {
      _id: request.params.machine_id,
    },
    (err, docs) => {
      if (err) {
        return response.status(400).send(err);
      } else {
        return response.status(200).send({ message: "Deleted" });
      }
    }
  );
});

router.patch(
  "/:machine_id/name",
  auth,
  verifyAdmin,
  async (request, response) => {
    const { updated } = Machine.findOneAndUpdate(
      { _id: request.params.machine_id },
      { name: request.body.name },
      (err, docs) => {
        if (err) {
          return response.status(400).send(err);
        } else {
          return response.status(200).send({ message: "updated" });
        }
      }
    );
  }
);

router.patch(
  "/:machine_id/IP",
  auth,
  verifyAdmin,
  async (request, response) => {
    const { updated } = Machine.findOneAndUpdate(
      { _id: request.params.machine_id },
      { IP: request.body.IP },
      (err) => {
        if (err) {
          return response.status(400).send(err);
        } else {
          return response.status(200).send({ message: "updated" });
        }
      }
    );
  }
);

router.patch(
  "/:machine_id/user",
  auth,
  verifyAdmin,
  async (request, response) => {
    const { updated } = Machine.findOneAndUpdate(
      { _id: request.params.machine_id },
      { user: request.body.user },
      (err) => {
        if (err) {
          return response.status(400).send(err);
        } else {
          return response.status(200).send({ message: "updated" });
        }
      }
    );
  }
);

router.patch(
  "/:machine_id/password",
  verifyAdmin,
  auth,
  async (request, response) => {
    const { updated } = Machine.findOneAndUpdate(
      { _id: request.params.machine_id },
      { password: request.body.password },
      (err) => {
        if (err) {
          return response.status(400).send(err);
        } else {
          return response.status(200).send({ message: "updated" });
        }
      }
    );
  }
);

module.exports = router;
