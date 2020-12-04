const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { response } = require("express");
const Machine = require("./models/Machines");

function preCommand(machine) {
  return `ipmitool -I lanplus -U ${machine.user} -P ${machine.password} -p ${machine.port} -H ${machine.IP} `;
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

module.exports = { powerManagement, bootManagement };
