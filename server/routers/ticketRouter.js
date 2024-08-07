const express = require('express');
const TicketDto = require('../dto/ticketDto');
const { getValidator, COMPONENTS } = require('../utils/validator');
const { CustomError } = require('../utils/errorHandle');
const { validationResult } = require('express-validator');
const dbManager = require('../utils/db');
const Logger = require('../utils/logger');
const { ROLES, TICKET_CATEGORY } = require('../utils/general');
const { authorization } = require('../utils/security');
const dayjs = require('dayjs');
const config = require('../config');


const ticketRouter = express.Router();
const db = dbManager.getSession();
const logger = new Logger('ticketRouter');
const ticketValidator = getValidator(COMPONENTS.ticket);
const ticketDto = new TicketDto(db);
const dateFormat = config?.generalTimeFormat || 'YYYY-MM-DD HH:mm:ss';

ticketRouter.all('/', ticketValidator, async (req, res, next) => {
    try {
        if (req.method === 'GET') {
            let page = Number(req.query.page);
            let size = Number(req.query.size);
            let tickets = await ticketDto.getTickets(page, size, 'timestamp', 'DESC');
            res.json(tickets);
        }
        else if (req.method === 'POST') {

            let auth = req.headers.authorization;
            let payload = await authorization(auth, [ROLES.ADMIN, ROLES.USER]);

            let errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error('Validation Error: ', JSON.stringify(errors.array()));
                throw new CustomError('Validation Error', 'validation', 400);
            }
            let ticket = req.body;
            ticket.category = ticket.category.toLowerCase();
            ticket.state = 'open';
            ticket.owner = payload.username;
            let result = await ticketDto.createTicket(ticket);
            logger.info(`Ticket created successfully with id: ${result.id}`);

            res.json(result);
        }
        else {
            logger.error('Method Not Allowed');
            throw new CustomError('Method Not Allowed', 'method', 405);
        }
    } catch (error) {
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }
}
);

ticketRouter.put("/:id/state/:state", async (req, res, next) => {
    try {
        let auth = req.headers.authorization;
        let payload = await authorization(auth, [ROLES.ADMIN, ROLES.USER]);

        let id = Number(req.params.id);
        let state = req.params.state;
        if (state !== 'open' && state !== 'closed') {
            logger.error('Invalid status');
            throw new CustomError('Invalid status', 'invalid', 400);
        }

        let ticket = await ticketDto.getTicket(id);
        if (!ticket) {
            logger.error('Ticket Not Found');
            throw new CustomError('Ticket Not Found', 'not_found', 404);
        }

        if (payload.role === ROLES.USER && ticket.owner !== payload.username) {
            logger.error('Unauthorized');
            throw new CustomError('Unauthorized', 'unauthorized', 401);
        }

        let result = await ticketDto.updateTicketStatus(id, state);
        if (!result) {
            logger.error('Failed to update ticket');
            throw new CustomError('Failed to update ticket', 'internal', 500);
        }
        logger.info(`Ticket with id: ${id} updated status to ${state} successfully`);
        res.json({
            message: 'Ticket updated successfully',
            timestamp: dayjs().format(dateFormat)
        });
    } catch (error) {
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }

});

ticketRouter.get('/:id', async (req, res, next) => {
    try {
        let auth = req.headers.authorization;
        let payload = await authorization(auth, [ROLES.ADMIN, ROLES.USER]);

        let id = Number(req.params.id);
        let ticket = await ticketDto.getTicket(id);
        if (!ticket) {
            logger.error('Ticket Not Found');
            throw new CustomError('Ticket Not Found', 'not_found', 404);
        }
        logger.info(`Ticket with id: ${id} retrieved successfully`);
        res.json(ticket);
    } catch (error) {
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }
});

ticketRouter.put('/:id/category/:category', async (req, res, next) => {

    try {
        let auth = req.headers.authorization;
        let payload = await authorization(auth, [ROLES.ADMIN]);

        let id = Number(req.params.id);
        let category = req.params.category;
        category = category.toLowerCase();

        if (!Object.values(TICKET_CATEGORY).includes(category)) {
            logger.error('Invalid category');
            throw new CustomError('Invalid category', 'invalid', 400);
        }

        let ticket = await ticketDto.getTicket(id);
        if (!ticket) {
            logger.error('Ticket Not Found');
            throw new CustomError('Ticket Not Found', 'not_found', 404);
        }

        let result = await ticketDto.updateTicketCategory(id, category);
        if (!result) {
            logger.error('Failed to update ticket');
            throw new CustomError('Failed to update ticket', 'internal', 500);
        }
        logger.info(`Ticket with id: ${id} updated category to ${category} successfully`);
        res.json({
            message: 'Ticket updated successfully',
            timestamp: dayjs().format(dateFormat)

        });
    }
    catch (error) {
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }

});


ticketRouter.get("/search/:searchWord", async (req, res, next) => {
    try{
        let page = Number(req.query.page);
        let size = Number(req.query.size);
        let searchWord = req.params.searchWord.toLowerCase();
        let tickets = await ticketDto.searchTickets(searchWord, page, size, 'timestamp', 'DESC');

        logger.info(`Tickets with search word ${searchWord} retrieved successfully`);

        res.json(tickets);


    }
    catch(error){
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }

});



module.exports = ticketRouter;
