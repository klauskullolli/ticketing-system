`use strict`;
const config = require('../config');
const crypto = require('crypto');
const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');
const dbManager = require('./db');
const SessionDto = require('../dto/sessionDto');
const Logger = require('./logger');
const { CustomError } = require('./errorHandle');

const db = dbManager.getSession();
const sessionDto = new SessionDto(db);
const logger = new Logger('security');



const secret = config?.jwtSecret;
const expiration = config?.jwtExpiration;

const generateRandom = (length) => {
    return crypto.randomBytes(length).toString('base64');
}

const digestMessage = (message, salt) => {
    message = message + salt;
    return crypto.createHash('sha256').update(message).digest('base64');
};


const generateToken = (payload) => {

    if (!payload) {
        throw new Error('payload is required');
    }
    payload.exp = dayjs().add(expiration, 'seconds').unix();
    return jwt.sign(payload, secret);
}

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


module.exports = { generateRandom, digestMessage, verifyToken, generateToken, authorization };