const Joi = require("joi");

module.exports = (data) => {
    const schema =  Joi.object({
        name: Joi.string().min(2).max(20),
        machines: Joi.array()
    });

    return schema.validate(data);
}