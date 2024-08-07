const express = require('express');
const usersDto = require('../dto/usersDto');
const { getValidator, COMPONENTS } = require('../utils/validator');
const { CustomError } = require('../utils/errorHandle');
const { validationResult } = require('express-validator');
const dbManager = require('../utils/db');
const Logger = require('../utils/logger');
const { ROLES } = require('../utils/general');
const { authorization } = require('../utils/security');
const SessionDto = require('../dto/sessionDto');
const { digestMessage, generateRandom } = require('../utils/security');
const dayjs = require('dayjs');
const logger = new Logger('userRouter');
const config = require('../config');


const userRouter = express.Router();
const db = dbManager.getSession();
const userValidator = getValidator(COMPONENTS.user);
const userDto = new usersDto(db);
const sessionDto = new SessionDto(db);
const dateFormat = config?.generalTimeFormat || 'YYYY-MM-DD HH:mm:ss';

userRouter.get('/', async (req, res, next) => {
    try {
        let header = req.headers.authorization;
        let payload = await authorization(header, [ROLES.ADMIN, ROLES.USER]);
        let user = await userDto.getUserByUsername(payload.username);
        if (!user) {
            logger.error('User Not Found');
            throw new CustomError('User Not Found', 'not_found', 404);
        }

        logger.info(`User ${user.username} retrieved`);

        let result = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.json(result);
    }
    catch (error) {
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }
});

userRouter.put('/', async (req, res, next) => {
    try {
        let header = req.headers.authorization;
        let payload = await authorization(header, [ROLES.ADMIN, ROLES.USER]);

        console.log(payload.username)

        let user = await userDto.getUserByUsername(payload.username);
        if (!user) {
            logger.error('User Not Found');
            throw new CustomError('User Not Found', 'not_found', 404);
        }
        let body = req.body;

        let newUser = {}
        newUser.id = user.id;

        if (body?.username && body.username !== user.username) {
            let exists = await userDto.getUserByUsername(body.username);
            if (exists) {
                logger.error('Username already exists');
                throw new CustomError('Username already exists', 'exist', 400);
            }
            newUser.username = body.username;
        }

        if (body?.email && body.email !== user.email) {
            let exists = await userDto.getUserByEmail(body.email);
            if (exists) {
                logger.error('Email already exists');
                throw new CustomError('Email already exists', 'exist', 400);
            }
            newUser.email = body.email;
        }

        let updated = await userDto.updateUser(newUser);

        if (!updated) {
            logger.error('Failed to update user');
            throw new CustomError('Failed to update user', 'internal', 500);
        }

        logger.info(`User with id: ${user.id} updated`);

        try {
            await sessionDto.deleteSession(payload.username);
            logger.info(`Session deleted with username ${payload.username}`);
        }
        catch (error) {
            logger.error('Failed to delete session');
        }

        res.json({ message: 'User updated successfully', timestamp: dayjs().format(dateFormat) });
    }
    catch (error) {
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }
});


userRouter.put('/change_password', async (req, res, next) => {
    try {
        let header = req.headers.authorization;
        let payload = await authorization(header, [ROLES.ADMIN, ROLES.USER]);
        let user = await userDto.getUserByUsername(payload.username);
        if (!user) {
            logger.error('User Not Found');
            throw new CustomError('User Not Found', 'not_found', 404);
        }
        let body = req.body;
        let oldPassword = body.oldPassword;
        let newPassword = body.newPassword;
        if (!oldPassword || !newPassword) {
            logger.error('Invalid inputs');
            throw new CustomError('Invalid inputs', 'invalid', 400);
        }

        if (oldPassword === newPassword) {
            logger.error('Invalid same password');
            throw new CustomError('Use another password', 'invalid', 400);
        }

        let valid = digestMessage(oldPassword, user.salt) === user.password;

        if (!valid) {
            logger.error('Invalid password');
            throw new CustomError('Invalid password', 'invalid', 400);
        }

        let salt = generateRandom(32);
        newPassword = digestMessage(newPassword, salt);

        let updated = await userDto.updatePassword({ id: user.id, password: newPassword, salt });
        if (!updated) {
            logger.error('Failed to update password');
            throw new CustomError('Failed to update password', 'internal', 500);
        }
        logger.info(`Password and salt updated for user ${user.username}`);

        try {
            await sessionDto.deleteSession(payload.username);
            logger.info(`Session deleted with username ${payload.username}`);
        }
        catch (error) {
            logger.error('Failed to delete session');
        }

        res.json({ message: 'Password updated successfully', timestamp: dayjs().format(dateFormat) });

    } catch (error) {
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }
})

module.exports = userRouter;

