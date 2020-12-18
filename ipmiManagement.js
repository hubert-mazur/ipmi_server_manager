const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { response } = require("express");
const Machine = require("./models/Machines");

function preCommand(machine) {
  if (!machine.scriptUsage)
    return `ipmitool -I lanplus -U ${machine.user} -P ${machine.password} -p ${machine.port} -H ${machine.IP} `;
  else return `${machine.script} `;
}

async function powerManagement(machine, option) {
  actions = ["on", "off", "reset", "soft", "status"];

  if (!actions.includes(option)) {
    return { error: `Unknown command: ${option} ` };
  }

  command = preCommand(machine);
  command += `chassis power ${option}`;

  try {
    const { stdout, stderr } = await exec(command);

    if (stderr) {
      return { error: true, meta: "", body: stderr };
    }

    return { error: false, meta: "", body: stdout };
  } catch (err) {
    return { error: true, meta: "", body: err };
  }
}

async function bootManagement(machine, option) {
  command = preCommand(machine);
  if (option != undefined) command += `chassis bootdev ${option}`;
  else command += "chassis bootdev";

  try {
    const { stdout, stderr } = await exec(command);

    if (stderr) {
      return { error: true, meta: "stderr", body: stderr };
    }

    return { error: false, meta: "OK", body: stdout };
  } catch (err) {
    return { error: true, meta: "", body: err };
  }
}

async function getBootDevice(machine, option) {
  command = preCommand(machine);
  command += `chassis bootparam get 5`;

  try {
    const { stdout, stderr } = await exec(command);

    if (stderr) {
      return { error: true, meta: "stderr", body: stderr };
    }

    return { error: false, meta: "OK", body: stdout };
  } catch (err) {
    return { error: true, meta: "", body: err };
  }
}

async function sensorsReading(machine) {
  command = preCommand(machine);
  command += `sensor`;

  try {
    const { stdout, stderr } = await exec(command);

    if (stderr) {
      return { error: true, meta: "stderr", body: stderr };
    }

    return { error: false, meta: "OK", body: stdout };
  } catch (err) {
    return { error: true, meta: "", body: err };
  }
}

//   return {
//     error: false,
//     meta: "",
//     body:
//       "UID Light        | 0x0        | discrete   | 0x0080| na        | na        | na        | na        | na        | na        \n \
//   Health LED       | 0x0        | discrete   | 0x0080| na        | na        | na        | na        | na        | na        \n \
//   VRM 1            | 0x0        | discrete   | 0x0280| na        | na        | na        | na        | na        | na        \n \
//   VRM 2            | 0x0        | discrete   | 0x0280| na        | na        | na        | na        | na        | na        \n \
//   01-Inlet Ambient | 19.000     | degrees C  | ok    | na        | na        | na        | na        | 42.000    | 46.000    \n \
//   02-CPU 1         | 40.000     | degrees C  | ok    | na        | na        | na        | na        | 82.000    | 83.000    \n \
//   03-CPU 2         | 40.000     | degrees C  | ok    | na        | na        | na        | na        | 82.000    | 83.000    \n \
//   04-P1DIMMs 1-3   | 30.000     | degrees C  | ok    | na        | na        | na        | na        | 87.000    | 92.000    \n \
//   05-P2DIMMs 1-3   | 25.000     | degrees C  | ok    | na        | na        | na        | na        | 87.000    | 92.000    \n \
//   06-P1Mem Zone    | 29.000     | degrees C  | ok    | na        | na        | na        | na        | 81.000    | 86.000    \n \
//   07-P2Mem Zone    | 31.000     | degrees C  | ok    | na        | na        | na        | na        | 81.000    | 86.000    \n \
//   08-Chipset Zone  | 36.000     | degrees C  | ok    | na        | na        | na        | na        | 81.000    | 86.000    \n \
//   09-Chipset       | 38.000     | degrees C  | ok    | na        | na        | na        | na        | 105.000   | 110.000   \n \
//   10-NIC           | 43.000     | degrees C  | ok    | na        | na        | na        | na        | 105.000   | 115.000   \n \
//   11-Sys Exhaust   | 26.000     | degrees C  | ok    | na        | na        | na        | na        | 70.000    | 75.000    \n \
//   12-Sys Exhaust   | 26.000     | degrees C  | ok    | na        | na        | na        | na        | 70.000    | 75.000    \n \
//   Virtual Fan      | 37.632     | percent    | ok    | na        | na        | na        | na        | na        | na        \n \
//   Enclosure Status | 0x0        | discrete   | 0x0080| na        | na        | na        | na        | na        | na        \n \
//   Memory Status    | 0x0        | discrete   | 0x4080| na        | na        | na        | na        | na        | na        \n \
//   Power Meter      | 64         | Watts      | ok    | na        | na        | na        | na        | na        | na ",
//   };
// }

module.exports = {
  powerManagement,
  bootManagement,
  sensorsReading,
  getBootDevice,
};
