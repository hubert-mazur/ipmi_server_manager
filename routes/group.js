const router = require("express").Router();
const joi = require("joi");
const Group = require("../models/Group");
const { request, response } = require("express");
const auth = require("../verifyToken");
const groupValidation = require("../validationSchemas/group");
const User = require("../models/User");
const admin = require("../admins");
const { deleteOne, update } = require("../models/Group");
const Machines = require("../models/Machines");
const verifyAdmin = require("../verifyUser");

router.post("/", auth, verifyAdmin, async (request, response) => {
  const { validationError } = groupValidation(request.body);

  if (validationError) {
    return response.status(400).send(validationError);
  }

  const group = new Group({
    name: request.body.name,
  });

  try {
    const savedGroup = await group.save();
    return response.status(200).send({ _id: savedGroup._id });
  } catch (err) {
    return response.status(400).send(err);
  }
});

router.get("/", auth, async (request, response) => {
  if (admin(request._id)) {
    const groups = await Group.find();
    if (!groups) {
      return response.status(500).send(groups);
    }
    return response.status(200).send(groups);
  } else {
    const user = await User.find({ _id: request._id });

    if (!user) {
      return response.status(400).send(user);
    }

    const groups = Group.find({ _id: { $in: user.groups } });

    if (!groups) {
      return response.status(400).send(groups);
    }

    return response.status(200).send(groups);
  }
});

router.delete("/:group_id", auth, verifyAdmin, async (request, response) => {
  const deleted = await Group.deleteOne(
    { _id: request.params.group_id },
    (err, docs) => {
      if (err) {
        return response.status(400).send(deleted);
      } else {
        return response
          .status(200)
          .send({ message: "deleted", count: deleted });
      }
    }
  );
});

router.patch(
  "/:group_id/name",
  auth,
  verifyAdmin,
  async (request, response) => {
    const updated = Group.findOneAndUpdate(
      { _id: request.params.group_id },
      { name: request.body.name },
      (err, docs) => {
        if (err) {
          return response.status(400).send(err);
        } else {
          return response.status(200).send({
            message: "updated",
            _id: request.params.group_id,
            name: request.body.name,
          });
        }
      }
    );
  }
);

router.put("/:group_id/users", auth, verifyAdmin, async (request, response) => {
  const userExists = await User.exists({ _id: request.body.user_id });

  if (!userExists) {
    return response.status(400).send({
      message: `User with id ${request.body.user_id} does not exists`,
    });
  }

  const group = Group.findOneAndUpdate(
    { _id: request.params.group_id },
    { $addToSet: { users: request.body.user_id } },
    (err, doc) => {
      if (err) {
        return response.status(400).send(err);
      } else {
        return response.status(200).send({ message: "Added" });
      }
    }
  );
});

router.delete("/:group_id/users/:user_id", auth, async (request, response) => {
  if (!admin(request._id) && request._id != request.params.user_id) {
    return response
      .status(401)
      .send({ message: "You are not allowed to delete users from groups" });
  }

  const deleted = Group.findOneAndUpdate(
    { _id: request.params.group_id },
    { $pull: { users: request.params.user_id } },
    (err, docs) => {
      if (err) {
        return response.status(400).send(err);
      } else {
        return response.status(200).send({ message: "deleted" });
      }
    }
  );
});

router.put(
  "/:group_id/machines",
  auth,
  verifyAdmin,
  async (request, response) => {
    const machineExists = await Machines.exists({
      _id: request.body.machine_id,
    });

    if (!machineExists) {
      return response.status(400).send({ message: "No such machine exists" });
    }

    const { updated } = Group.findOneAndUpdate(
      { _id: request.params.group_id },
      { $addToSet: { machines: request.body.machine_id } },
      (err, docs) => {
        if (err) {
          return response.status(400).send(err);
        } else {
          return response.status(200).send({ message: "Updated" });
        }
      }
    );
  }
);

router.delete(
  "/:group_id/machines/:machine_id",
  auth,
  verifyAdmin,
  async (request, response) => {
    const deleted = Group.findOneAndUpdate(
      { _id: request.params.group_id },
      { $pull: { machines: request.params.machine_id } },
      (err, docs) => {
        if (err) {
          return response.status(400).send(err);
        } else {
          return response.status(200).send({ message: "deleted" });
        }
      }
    );
  }
);

module.exports = router;
