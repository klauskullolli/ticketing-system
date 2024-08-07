'use strict';

const dayjs = require('dayjs');
const config = require('../config');
const Logger = require('./logger');

const logger = new Logger('errorHandle');


const errorHandle = async (err, req, res, next) => {
    try {

        let timeFormat = config?.generalTimeFormat || 'YYYY-MM-DD HH:mm:ss';


        if (err instanceof CustomError) {
            logger.error(err.message);
        }
        else {
            console.error(err);
        }

        if (!(err instanceof CustomError)) {
            err.message = 'Internal Server Error';
        }

        const error = {
            message: err.message || 'Internal Server Error',
            type: err.type || 'unknown',
            time: dayjs().format(timeFormat)
        };
        res.status(err.status || 500).json(error);
    } catch (error) {
        console.error(error);

        res.status(500).json({ message: 'Internal Server Error' });
    }
};

class CustomError extends Error {
    constructor(message, type, status) {
        super(message);
        this.type = type;
        this.status = status || 500;
    }
}

module.exports = { errorHandle, CustomError };

