`use strict`;

const sqlite3 = require('sqlite3');
const config = require('../config');
const Logger = require('./logger'); 
const DB_URL = config?.dbUrl || './resources/ticket_system.db';

const logger = new Logger("dbManager");  

const dbManager = {};

dbManager.__db = null;

dbManager.newSession = () => {
    return new sqlite3.Database(DB_URL, (err) => {
        if (err) {
            throw new Error(err.message);

        } else {
            logger.info('Connected to the database.');  
        }

    });
};


dbManager.getSession = () => {
    if (dbManager.__db) {
        return dbManager.__db;
    }
    dbManager.__db = dbManager.newSession();

    dbManager.__db.run('PRAGMA foreign_keys = ON;', function (err) {
        if (err) {
            throw new Error(err.message);
        }
        logger.info('Foreign keys enabled...');
    });

    return dbManager.__db;
}


dbManager.openTransaction = async (db) => {
    const query = 'BEGIN TRANSACTION;';

    return new Promise((resolve, reject) => {
        db.run(query, function (err) {
            if (err) {
                reject(err);
            }
            logger.info('BEGIN TRANSACTION...');    
            resolve(true);
        });
    }
    );
};

dbManager.commitTransaction = async (db) => {
    const query = 'COMMIT;';

    return new Promise((resolve, reject) => {
        db.run(query, function (err) {
            if (err) {
                reject(err);
            }
            logger.info('COMMIT TRANSACTION...');     
            resolve(true);
        });
    }); 
};

dbManager.rollbackTransaction = (db) => {
    const query = 'ROLLBACK;';
    return new Promise((resolve, reject) => {
        db.run(query, function (err) {
            if (err) {
                reject(err);
            }
            logger.info('ROLLBACK TRANSACTION...');
            resolve(true);
        });
    }); 
};

dbManager.closeSession = (db) => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
            }
            logger.info('Close the database connection.');  
            resolve(true);
        });
    });    
};

module.exports = dbManager; 