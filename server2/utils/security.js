`use strict`; 

const config = require('../config');
const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');
const sqlite =  require('sqlite3');
const SessionDto = require('../dto/sessionDto');    
const {CustomError} = require('./errorHandle');
const Logger = require('./logger');


const secret = config?.jwtSecret;   
const expiration = config?.jwtExpiration;   
const dbUrl = config?.dbUrl || '../server/resources/ticket_system.db';
const logger = new Logger('security');  

const db = new sqlite.Database(dbUrl, (err) => { 
    if (err) {
        throw new Error(err.message);
    } 
});

const sessionDto = new SessionDto(db);  

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, secret);
        if (decoded?.exp < dayjs().unix()) {
            throw new CustomError('Unauthorized', 'invalid_token', 401);
        }
        return decoded;
    } catch (error) {
        throw new CustomError('Unauthorized', `invalid_token`, 401);
    }

}

const authorization = async (header, roles) => {
    if (!header) {
        throw new CustomError('Unauthorized', 'unauthorized', 401); 
    }
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    if (!roles.includes(decoded.role)) {
        throw new CustomError('Unauthorized', 'unauthorized', 401);
    }

    let session = await sessionDto.getSession(decoded.username);
    if (!session) {
        logger.debug('Session not found');
        throw new CustomError('Unauthorized', 'unauthorized', 401);
    }

    if (session.token !== token) {
        logger.debug('Invalid token');
        throw new CustomError('Unauthorized', 'unauthorized', 401);
    }

    logger.info(`Authorized user: ${decoded.username}`);

    return decoded;
}


module.exports = authorization; 