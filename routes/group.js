const router = require("express").Router();
const joi = require("joi");
const validation = require("../validationSchemas/group");
const Group = require("../models/Group");
const { request, response } = require("express");
const auth = require("../verifyToken");
const group = require("../validationSchemas/group");
const User = require("../models/User");
const admin = require("../admins");
const { deleteOne, update } = require("../models/Group");

router.post("/", auth, async (request, response) => {
  if (!admin(request._id)) {
    return response
      .status(401)
      .send({ message: "You are not allowed to create groups" });
  }

  const { validationError } = validation(request.body);

  if (validationError) {
    response.status(400).send(validationError);
  }

  const group = new Group({
    name: request.body.name,
  });

  try {
    const savedGroup = await group.save();
    response.status(200).send({ _id: savedGroup._id });
  } catch (err) {
    response.status(400).send(err);
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

router.delete("/:id", auth, async (request, response) => {
  if (!admin(request._id)) {
    return response.status(401).send("You are not allowed to delete groups");
  }

  const deleted = await Group.deleteOne({ _id: request.params.id });

  if (!deleted) {
    return response.status(400).send(deleted);
  }

  return response.status(200).send({ message: "deleted", count: deleted });
});

router.patch("/:id/name", auth, async (request, response) => {
  if (!admin(request._id)) {
    return response
      .status(401)
      .send({ message: "You are not allowed to modify groups" });
  }

  const updated = Group.findOneAndUpdate(
    { _id: request.params.id },
    { name: request.body.name },
    (err) => {
      if (err) {
        return response.status(400).send(err);
      }
    }
  );
  if (!updated) {
    return response.status(400).send(updated);
  }

  return response.status(200).send({ message: "updated" });
});

router.put("/users/:group_id", auth, async (request, response) => {
  if (!admin(request._id)) {
    return response
      .status(401)
      .send({ message: "You are not allowed to modify user groups belonging" });
  }

  const group = Group.findOneAndUpdate(
    { _id: request.params.group_id },
    { $push: { users: request.body.id } },
    (err, doc) => {
      if (err) {
        return response.status(400).send(err);
      }
    }
  );

  return response.status(200).send({ message: "Updated" });
});

router.delete("/users/:group_id/:user_id", auth, async (request, response) => {
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
      }
    }
  );
  if (deleted) {
    return response.status(200).send({ message: "deleted" });
  }
});

module.exports = router;
