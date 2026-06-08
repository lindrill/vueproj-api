// validation
const joi = require('@hapi/joi');
const { model } = require('mongoose');

// Register validation

const registerValidation = (data) => {
    const schema = joi.object ({
        first_name: joi.string().min(3).required(),
        last_name: joi.string().min(3).required(),
        email: joi.string().min(6).required().email(),
        password: joi.string().min(6).required()
    });

    // validate data before adding user
    return schema.validate(data);
    // if (error) return res.send(error.details[0].message);
}

const loginValidation = (data) => {
    const schema = joi.object ({
        email: joi.string().min(6).required().email(),
        password: joi.string().min(6).required(),
    });

    return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;