const dayjs = require('dayjs');
const config = require('../config');

const timeFormat = config?.timeFormat || 'YYYY-MM-DD HH:mm:ss';

Logger = function (name) {
    this.name = name;

    this.debug = (message) => {
        console.log(`${this.name} - DEBUG - ${dayjs().format(timeFormat)} - ${message} `);
    }

    this.info = (message) => {
        console.log(`${this.name} - INFO - ${dayjs().format(timeFormat)} - ${message} `);
    }

    this.error = (message) => {
        console.log(`${this.name} - ERROR - ${dayjs().format(timeFormat)} - ${message} `);
    }
}



module.exports = Logger;

