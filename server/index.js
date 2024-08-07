'use strict';
const config = require('./config');
const { errorHandle, CustomError } = require('./utils/errorHandle');
const { validationResult } = require('express-validator');
const morgan = require('morgan');
const userRouter = require('./routers/userRouter');
const express = require('express');
const dayjs = require('dayjs');
const { getValidator, COMPONENTS } = require('./utils/validator');
const usersDto = require('./dto/usersDto');
const dbManager = require('./utils/db');
const { generateRandom, digestMessage, generateToken, authorization } = require('./utils/security');
const Logger = require('./utils/logger');
const SessionDto = require('./dto/sessionDto');
const { ROLES } = require('./utils/general');
const TicketDto = require('./dto/ticketDto');
const TextBlockDto = require('./dto/textBlockDto');
const ticketRouter = require('./routers/ticketRouter');
const textBlockRouter = require('./routers/textBlockRouter'); 
const cors = require("cors");

const logger = new Logger('server');

// init express
const app = new express();

const db = dbManager.getSession();
const userDto = new usersDto(db);
const sessionDto = new SessionDto(db);
const ticketDto = new TicketDto(db);
const textBlockDto = new TextBlockDto(db);
const port = config?.port || 3001;
const loginValidator = getValidator(COMPONENTS.login);
const userValidator = getValidator(COMPONENTS.user);
const timeFormat = config?.generalTimeFormat || 'YYYY-MM-DD HH:mm:ss';

const corsOptions = config?.corsOptions || {
  origin: "http://localhost:5173",
  credentials: true

}; 

app.use(morgan('dev'));
app.use(express.json());
app.use(cors())

 

app.get('/config', (req, res) => {

  let response = {
    port: config.port,
    host: config.host,
    time: dayjs().format(timeFormat),
    message: 'server running'
  };

  res.json(response);

});

app.get('/error', (req, res, next) => {
  next(new CustomError('Custom Error', 'custom', 400));
});

app.post('/signup', userValidator, async (req, res, next) => {
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation Error: ', JSON.stringify(errors.array()));
      throw new CustomError('Validation Error', 'validation', 400);
    }
    let user = req.body;
    let dbUser = await userDto.getUserByUsername(user.username);
    if (dbUser) {
      logger.error(`User ${user.username} already exists`);
      throw new CustomError('User already exists', 'conflict', 409);
    }

    dbUser = await userDto.getUserByEmail(user.email);
    if (dbUser) {
      logger.error(`Email ${user.email} already exists`);
      throw new CustomError('Email already exists', 'conflict', 409);
    }

    let salt = generateRandom(32);
    user.salt = salt;
    user.password = digestMessage(user.password, salt);
    user.role = user.role.toLowerCase();
    const result = await userDto.createUser(user);
    res.status(201).json(result);
  }
  catch (error) {
    logger.error(error?.message || 'Internal Server Error');
    next(error);
  }
});

app.post('/login', loginValidator, async (req, res, next) => {
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(`Validation Error: ${JSON.stringify(errors.array())}`);
      throw new CustomError('Validation Error', 'validation', 400);
    }

    let user = req.body;
    let dbUser = await userDto.getUserByUsername(user.username);
    if (!dbUser) {
      logger.debug(`User ${user.username} not found`);
      dbUser = await userDto.getUserByEmail(user.username);
      if (!dbUser) {
        logger.error(`User ${user.username} not found`);
        throw new CustomError('User Not Found', 'not_found', 404);
      }
    }

    let hash = digestMessage(user.password, dbUser.salt);
    if (hash !== dbUser.password) {
      logger.error('Invalid Credentials');
      throw new CustomError('Invalid Credentials', 'unauthorized', 401);
    }

    let payload = {
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role
    };
    let token = generateToken(payload);

    let session = await sessionDto.getSession(dbUser.username);
    if (!session) {
      logger.info(`Creating session for user ${dbUser.username} ...`);
      let created = await sessionDto.createSession(dbUser.username, token);
      if (!created) {
        logger.error('Failed to create session');
        throw new CustomError('Failed to create session', 'internal', 500);
      }
    } else {
      logger.info(`Updating session for user ${dbUser.username} ...`);
      let updated = await sessionDto.updateSession(dbUser.username, token);
      if (!updated) {
        logger.error('Failed to update session');
        throw new CustomError('Failed to update session', 'internal', 500);
      }
    }

    logger.info(`User ${dbUser.username} logged in ...`);
    res.json({ token, username: dbUser.username, role: dbUser.role, 'timestamp': dayjs().format(timeFormat) });

  }
  catch (error) {
    logger.error(error?.message || 'Internal Server Error');
    next(error);
  }

});


app.get('/auth', async (req, res, next) => {
  try {
    let payload = await authorization(req.headers?.authorization, [ROLES.ADMIN, ROLES.USER]);
    res.json({ 'auth': true, 'timestamp': dayjs().format(timeFormat) });
  } catch (error) {
    logger.error(error?.message || 'Internal Server Error');
    next(error);
  }
});


app.post('/logout', async (req, res, next) => {

  try {
    let payload = await authorization(req.headers?.authorization, [ROLES.ADMIN, ROLES.USER]);
    let session = sessionDto.getSession(payload.username);
    if (!session) {
      logger.error('Session not found');
      throw new CustomError('Session not found', 'not_found', 404);
    }

    let deleted = await sessionDto.deleteSession(payload.username);
    if (!deleted) {
      logger.error('Failed to delete session');
      throw new CustomError('Failed to delete session', 'internal', 500);
    }
    logger.info(`User ${payload.username} logged out`);
    res.json({
      message: 'User logged out',
      'timestamp': dayjs().format(timeFormat)
    });
  } catch (error) {
    logger.error(error?.message || 'Internal Server Error');
    next(error);
  }

});


const checkRunningDb = async () => {
  return new Promise((resolve, reject) => {
    db.run('SELECT 1', (err) => {
      if (err) {
        reject(err);
      }
      logger.info('Database is running...');
      resolve(true);
    });
  });
};

app.get('/test-db', async (req, res, next) => {
  try {
    let result = await checkRunningDb();
    res.json({ message: 'Database is running' });
  }
  catch (error) {
    logger.error(error?.message || 'Internal Server Error');
    next(error);
  }
});

app.use('/profile', userRouter);
app.use('/ticket', ticketRouter);
app.use('/text_block', textBlockRouter);

app.use(errorHandle);


app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
