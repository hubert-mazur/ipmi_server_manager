const Joi = require("joi");
// const schema = require("../models/Machines");

module.exports = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(4).max(30),
        IP: Joi.string().max(15).regex("^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"),
        user: Joi.string(),
        password: Joi.string()
    });

    return schema.validate(data);
}