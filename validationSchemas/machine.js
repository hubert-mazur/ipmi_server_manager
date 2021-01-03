const Joi = require("joi");
// const schema = require("../models/Machines");

module.exports = async (data) => {
  const schema = Joi.object({
    name: Joi.string().min(4).max(30),
    IP: Joi.string()
      .max(15)
      .regex(
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      ),
    port: Joi.string().regex(
      /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/
    ),
    user: Joi.string(),
    password: Joi.string(),
    scriptUsage: Joi.boolean(),
    script: Joi.string().allow(""),
  });

  return schema.validate(data);
};
