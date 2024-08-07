'use strict';
const express = require('express');
const config = require('./config');
const cors = require('cors');
const verifyToken = require('./utils/security');
const { errorHandle, CustomError } = require('./utils/errorHandle');
const authorization = require('./utils/security');
const Logger = require('./utils/logger'); 

// init express
const app = new express();
const port = config?.port || 3002;
const corsOptions = config?.corsOptions || {
  origin: "http://localhost:5173",
  credentials: true
};


const ROLES = {
  admin: 'admin',
  user: 'user'
}

app.use(express.json());
app.use(cors(corsOptions));

const logger = new Logger('server2'); 



const randBetween = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}


const calculateExpiration = (ticket) => {
  if (!ticket.title) {
    throw new CustomError("Invalid ticket title", 'invalid', 400);
  }
  if (!ticket.category) {
    throw new CustomError("Invalid ticket category", 'invalid', 400);
  }
  let title = ticket?.title?.replace(/[\s\r\n]+/g, '');
  let category = ticket?.category?.replace(/[\s\r\n]+/g, '');
  let hours = (title.length + category.length) * 10;
  hours = hours + randBetween(1, 240);

  let days = Math.floor(hours / 24);
  hours = hours % 24;
  return { days, hours };



};



app.post('/expire', async(req, res, next) => {
  try {
    let payload =await authorization(req.headers.authorization, [ROLES.admin, ROLES.user]);
    let body = req.body;
    if (Array.isArray(body)) {
      let result = [];
      body.forEach(item => {
        const { days, hours } = calculateExpiration(item);
        if (payload.role === 'admin') {
          item.expire = { days, hours };
        }
        else {
          item.expire = { days };
        }
        result.push(item);
      });
      logger.info(`Tickets expiration calculated`);
      res.json(result);
    }
    else {
      const { days, hours } = calculateExpiration(body);
      if (payload.role === 'admin') {
        body.expire = { days, hours };
      }
      else {
        body.expire = { days };
      }
      logger.info(`Ticket ${body.title} expiration calculated`);
      res.json(body);

    }
  } catch (error) {
    next(error);
  }
});


app.use(errorHandle);

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
