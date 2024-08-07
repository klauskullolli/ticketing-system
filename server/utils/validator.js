'use strict';
const dayjs = require('dayjs');
const config = require('../config');
const { body } = require('express-validator');
const { TICKET_STATUS, TICKET_CATEGORY } = require('./general');


const COMPONENTS = {
    user: 'user',
    ticket: 'ticket',
    login: 'login'
};


const validateRole = (value) => {
    if (value.toLowerCase() !== 'admin' && value.toLowerCase() !== 'user') {
        throw new Error('Invalid Role');
    }
    return true;
}


const validateStatus = (value) => {
    if (value.toLowerCase() !== TICKET_STATUS.OPEN && value.toLowerCase() !== TICKET_STATUS.CLOSED) {
        throw new Error('Invalid Status');
    }
    return true;

}

const validateCategory = (value) => {
    value = value.toLowerCase();
    let categories = Object.values(TICKET_CATEGORY);
    if (!categories.includes(value)) {
        throw new Error('Invalid Category');
    }
    return true;

}


const userValidator = [
    body('username')
        .exists().withMessage("username is required")
        .notEmpty().withMessage("username not empty")
        .isString().withMessage("username should be a string")
        .escape(),

    body('password')
        .exists().withMessage("password is required")
        .notEmpty().withMessage("password not empty")
        .isString().withMessage("password should be a string")
        .escape(),

    body('email')
        .exists().withMessage("email is required")
        .notEmpty().withMessage("email not empty")
        .isEmail().withMessage("email should be a valid email")
        .escape(),

    body('role')
        .exists().withMessage("role is required")
        .notEmpty().withMessage("role not empty")
        .custom(validateRole)
        .isString().withMessage("role should be a string")
        .escape()
]


const ticketValidator = [
    body('title')
        .exists().withMessage("title is required")
        .notEmpty().withMessage("title not empty")
        .isString().withMessage("title should be a string")
        .escape(),

    body('category')
        .exists().withMessage("description is required")
        .notEmpty().withMessage("description not empty")
        .isString().withMessage("description should be a string")
        .custom(validateCategory)
        .escape(),

    body('text')
        .exists().withMessage("text is required")
        .notEmpty().withMessage("text not empty")
        .isString().withMessage("text should be a string")
        .escape(),

];

const loginValidator = [
    body('username')
        .exists().withMessage("username is required")
        .notEmpty().withMessage("username not empty")
        .isString().withMessage("username should be a string")
        .escape(),

    body('password')
        .exists().withMessage("password is required")
        .notEmpty().withMessage("password not empty")
        .isString().withMessage("password should be a string")
        .escape(),
]


const getValidator = (component) => {
    switch (component) {
        case COMPONENTS.user:
            return userValidator;
        case COMPONENTS.ticket:
            return ticketValidator;
        case COMPONENTS.login:
            return loginValidator;

        default:
            return [];
    }
}


module.exports = { getValidator, COMPONENTS };

