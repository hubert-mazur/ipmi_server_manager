const Joi = require('joi');
const { schema } = require('../models/User');

const registerValidation = async (data) => {
    const schema = Joi.object({
        name: Joi.string().max(25).required(),
        lastName: Joi.string().max(25).required(),
        email: Joi.string().required().max(64).email(),
        password: Joi.string().required().max(2048).min(6),
        admin:Joi.bool()
      });

      return schema.validate(data);
};

const loginValidation = async (data) => {
    const schema = Joi.object({
        email: Joi.string().required().max(64).email(),
        password: Joi.string().required().max(2048),
      });

      return schema.validate(data);
};


module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;