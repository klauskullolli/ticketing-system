`use strict`;

const express = require('express');
const config = require('../config');
const { authorization } = require('../utils/security');
const { CustomError } = require('../utils/errorHandle');
const dbManager = require('../utils/db');
const TextBlockDto = require('../dto/textBlockDto');
const Logger = require('../utils/logger');
const { ROLES } = require('../utils/general')
const dayjs = require('dayjs');
const TicketDto = require('../dto/ticketDto');


const db = dbManager.getSession();
const textBlockDto = new TextBlockDto(db);
const logger = new Logger('textBlockRoute');
const textBlockRouter = express.Router();
const ticketDto = new TicketDto(db);
const dateFormat = config?.generalTimeFormat || 'YYYY-MM-DD HH:mm:ss';

textBlockRouter.post('/ticket/:ticket_id', async (req, res, next) => {
    try {
        let auth = req.headers.authorization;
        let payload = await authorization(auth, [ROLES.ADMIN, ROLES.USER]);
        let textBlock = req.body;
        if (!textBlock.text) {
            logger.error('Text is mandatory');
            throw new CustomError('Text is mandatory', 'validation', 400);
        }
        textBlock.owner = payload.username;
        textBlock.timestamp = dayjs().unix();
        textBlock.ticket_id = Number(req.params.ticket_id);

        const ticket = await ticketDto.getTicket(textBlock.ticket_id);
        if (!ticket) {
            logger.error('Ticket Not Found');
            throw new CustomError('Ticket Not Found', 'not_found', 404);
        }

        let result = await textBlockDto.createTextBlock(textBlock);
        logger.info(`Text block created successfully with id: ${result.id}`);
        res.status(201).json(result);
    }
    catch (error) {
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }
});

textBlockRouter.all('/:id', async (req, res, next) => {
    try {
        let auth = req.headers.authorization;
        let payload = await authorization(auth, [ROLES.ADMIN, ROLES.USER]);
        let id = Number(req.params.id);

        let dbTextBlock = await textBlockDto.getTextBlock(id);
        if (!dbTextBlock) {
            logger.error('Text block not found');
            throw new CustomError('Text block not found', 'not_found', 404);
        }

        if (req.method === 'PUT') {
            let textBlock = req.body?.text;
            if (!textBlock) {
                logger.error('Text is mandatory');
                throw new CustomError('Text is mandatory', 'validation', 400);
            }

            let result = await textBlockDto.updateTextBlock(id, textBlock);
            if (!result) {
                logger.error('Failed to update text block');
                throw new CustomError('Failed to update text block', 'internal', 500);
            }
            logger.info(`Text block with id: ${id} updated successfully`);

            dbTextBlock.text = textBlock;

            res.json(
                dbTextBlock
            );
        }
        if (req.method === 'DELETE') {
            let delId = await textBlockDto.deleteTextBlock(id);
            if (!delId) {
                logger.error('Failed to delete text block');
                throw new CustomError('Failed to delete text block', 'internal', 500);
            }

            logger.info(`Text block with id: ${delId} deleted successfully`);

            res.json({
                message: 'Text block deleted successfully',
                timestamp: dayjs().format(dateFormat)
            });
        }


    } catch (error) {
        logger.error(error?.message || 'Internal Server Error');
        next(error);
    }

});


module.exports = textBlockRouter;







