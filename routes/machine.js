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
const ipmi = require("../ipmiManagement");
const { update } = require("../models/Machines");
const errLog = require("../errorLog");

router.post("/", auth, verifyAdmin, async (request, response) => {
  const { validationStatus } = validation(request.body);

  if (validationStatus) {
    errLog(validationStatus, request._id);
    return response
      .status(400)
      .send({ error: true, meta: "validation error", body: validationStatus });
  }

  const machine = new Machine({
    name: request.body.name,
    IP: request.body.IP,
    port: request.body.port,
    user: request.body.user,
    password: request.body.password,
    assigned: false,
  });

  const savedMachine = await machine.save((err, docs) => {
    if (err) {
      errLog(err, request._id);
      return response.status(400).send({ error: true, meta: "", body: err });
    } else {
      return response
        .status(200)
        .send({ error: false, meta: "", body: { _id: docs._id } });
    }
  });
});

router.get("/", auth, async (request, response) => {
  const isAdmin = await admin(request._id);
  if (isAdmin) {
    const machines = await Machine.find((err, docs) => {
      if (err) {
        errLog(err, request._id);
        return { error: true, meta: "", body: err };
      }
    });
    if (!machines.error) {
      return response
        .status(200)
        .send({ error: false, meta: "", body: machines });
    } else {
      return response.status(400).send(machines);
    }
  } else {
    const user = await User.findOne({ _id: request._id }, (err, docs) => {
      if (err) {
        errLog(err, request._id);
        return { error: true, meta: "", body: err };
      } else if (!docs) {
        return { error: true, meta: "Not found", body: "" };
      }
    });

    if (user.error) {
      return user;
    }

    const machines = await Machine.find({ _id: user.machines }, (err, docs) => {
      if (err) {
        errLog(err, request._id);
        return { error: true, meta: "", body: err };
      }
    });

    if (machines.error) {
      return response.status(400).send(machines);
    }

    return response
      .status(200)
      .send({ error: false, meta: "", body: machines });
  }
});

router.get("/unassigned", auth, verifyAdmin, async (request, response) => {
  try {
    const machine = await Machine.find({ assigned: false });
    console.error(machine);
    return response
      .status(200)
      .send({ error: false, meta: "OK", body: machine });
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "", body: err });
  }
});

router.get("/owned/:user_id?", auth, async (request, response) => {
  let id = 0;
  if (request.params.user_id) id = request.params.user_id;
  else id = request._id;

  const user = await User.findOne({ _id: id }, (err, docs) => {
    if (err) {
      errLog(err, request._id);
      return { error: true, meta: "", body: err };
    } else if (!docs) {
      return { error: true, meta: "Not found", body: "" };
    }
  });

  if (user.error) {
    return user;
  }

  const machines = await Machine.find({ _id: user.machines }, (err, docs) => {
    if (err) {
      errLog(err, request._id);
      return { error: true, meta: "", body: err };
    }
  });

  if (machines.error) {
    return response.status(400).send(machines);
  }
  console.error(user);
  return response.status(200).send({ error: false, meta: "", body: machines });
});

router.delete("/:machine_id", auth, verifyAdmin, async (request, response) => {
  const updated = await User.updateMany(
    { machines: { $in: [request.params.machine_id] } },
    { $pull: { machines: request.params.machine_id } },
    (err, raw) => {
      if (err) {
        errLog(err, request._id);
        return { error: true, meta: "", body: "err" };
      } else {
        return { error: false, meta: "", body: "" };
      }
    }
  );

  if (updated.error) {
    return response.status(400).send(updated);
  }

  const deleted = await Machine.deleteOne(
    {
      _id: request.params.machine_id,
    },
    (err, docs) => {
      if (err) {
        errLog(err, request._id);
        return response.status(400).send({ error: true, meta: "", body: err });
      } else {
        return response
          .status(200)
          .send({ error: false, meta: "OK", body: "" });
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
          errLog(err, request._id);
          return response
            .status(400)
            .send({ error: true, meta: "", body: err });
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
          errLog(err, request._id);
          return response
            .status(400)
            .send({ error: true, meta: "", body: err });
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
          errLog(err, request._id);
          return response
            .status(400)
            .send({ error: true, meta: "", body: err });
        } else {
          return response
            .status(200)
            .send({ error: false, meta: "OK", body: {} });
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
          errLog(err, request._id);
          return response
            .status(400)
            .send({ error: true, meta: "", body: err });
        } else {
          return response
            .status(200)
            .send({ error: false, meta: "OK", body: {} });
        }
      }
    );
  }
);

router.get(
  "/:machine_id/chassis/power/:option",
  auth,
  async (request, response) => {
    const machine = await Machine.findById(
      request.params.machine_id,
      (err, docs) => {
        if (err) {
          errLog(err, request._id);
          return { error: true, meta: "", body: err };
        }

        if (!docs) {
          return {
            error: true,
            meta: "",
            body: { message: "No such machine" },
          };
        }
      }
    );

    if (!machine || machine.error) {
      return response
        .status(400)
        .send({ error: true, meta: "", body: machine });
    }

    result = await ipmi.powerManagement(machine, request.params.option);
    if (result.error) {
      return response.status(400).send(result);
    }

    result = result.body;

    if (request.params.option == "status") {
      result = result.split(" ");
      result = { "Chassis power status": result[result.length - 1].trim() };
    } else {
      result = result.split(":");
      result = { [(result[0] + "").trim()]: (result[1] + "").trim() };
    }

    return response.status(200).send({ error: false, meta: "", body: result });
  }
);

router.get("/:machine_id/sensor", auth, async (request, response) => {
  const machine = await Machine.findById(
    request.params.machine_id,
    (err, docs) => {
      if (err) {
        errLog(err, request._id);
        return { error: true, meta: "", body: err };
      }

      if (!docs) {
        return {
          error: true,
          meta: "",
          body: { message: "No such machine" },
        };
      }
    }
  );

  if (!machine || machine.error) {
    return response.status(400).send({ error: true, meta: "", body: machine });
  }

  result = await ipmi.sensorsReading(machine);
  if (result.error) {
    return response.status(400).send(result);
  }

  result = result.body;

  result = result.split(/\r?\n/);

  let out = [];
  for (let i = 0; i < result.length; i++) {
    out.push([result[i].split("|")]);
  }

  // console.error(out);

  return response.status(200).send({ error: false, meta: "", body: out });
});

router.get(
  "/:machine_id/chassis/bootdev/:option?",
  auth,
  verifyAdmin,
  async (request, response) => {
    const machine = await Machine.findById(
      request.params.machine_id,
      (err, docs) => {
        if (err) {
          errLog(err, request._id);
          return { error: true, meta: "", body: err };
        }

        if (!docs) {
          return {
            error: true,
            meta: "",
            body: { message: "No such machine" },
          };
        }
      }
    );

    if (!machine || machine.error) {
      return response
        .status(400)
        .send({ error: true, meta: "", body: machine });
    }

    result = await ipmi.bootManagement(machine, request.params.option);

    if (result.error && result.meta != "stderr") {
      return response.status(400).send(result);
    }

    result = result.body;
    if (request.params.option == undefined) {
      result = result.split("\n").slice(2);

      for (i in result) {
        if (result[i] == "") {
          result.splice(i, 1);
          continue;
        }
        item = result[i].trim().split(/:/);
        key = (item[0] + "").trim();
        value = (item[1] + "").trim();
        result[i] = { [key]: value };
      }
    }
    return response
      .status(200)
      .send({ error: false, meta: "Help", body: result });
  }
);

router.get(
  "/:machine_id/chassis/bootparam/",
  auth,
  verifyAdmin,
  async (request, response) => {
    const machine = await Machine.findById(
      request.params.machine_id,
      (err, docs) => {
        if (err) {
          errLog(err, request._id);
          return { error: true, meta: "", body: err };
        }

        if (!docs) {
          return {
            error: true,
            meta: "",
            body: { message: "No such machine" },
          };
        }
      }
    );

    if (!machine || machine.error) {
      return response
        .status(400)
        .send({ error: true, meta: "", body: machine });
    }

    result = await ipmi.getBootDevice(machine, request.params.option);

    if (result.error && result.meta != "stderr") {
      return response.status(400).send(result);
    }

    result = result.body;
    result = result
      .substring(result.search(/Boot Device Selector/))
      .split("\n")[0]
      .split(" ");
    result = result[result.length - 1].toLowerCase();

    console.error(result);

    return response.status(200).send({ error: false, meta: "", body: result });
  }
);

module.exports = router;
