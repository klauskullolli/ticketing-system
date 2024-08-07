const Logger = require('../utils/logger');
const dayjs = require('dayjs');
const config = require('../config');
const TextBlockDto = require('./textBlockDto');
const dbManager = require('../utils/db');


const dateFormat = config?.generalTimeFormat || 'YYYY-MM-DD HH:mm:ss';
const logger = new Logger('ticketDto');

const TicketDto = function (db) {
    if (!db) {
        throw new Error('Database is mandatory');
    }
    this.db = db;
    this.tableName = 'Ticket';
    this.TextBlockDto = new TextBlockDto(db);

    this.getTickets = async (page, size, sortBy, order) => {
        let query = "";
        if (!sortBy) {
            sortBy = 'id';
        }
        if (!order) {
            order = 'ASC';
        }
        
        if ((page === undefined || page === null) || (size === undefined || size === null)) {
            query = `SELECT * FROM ${this.tableName} ORDER BY ${sortBy} ${order}`;
        }
        else {
            query = `SELECT * FROM ${this.tableName} ORDER BY ${sortBy} ${order} LIMIT ${size} OFFSET ${page * size}`;
        }

        return new Promise((resolve, reject) => {
            let tickets = [];
            this.db.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    for (let row of rows) {
                        let ticket = {
                            id: row?.id,
                            title: row?.title,
                            category: row?.category,
                            state: row?.state,
                            owner: row?.owner,
                            timestamp: dayjs.unix(row?.timestamp).format(dateFormat),

                        };
                        tickets.push(ticket);
                    }
                    resolve(tickets);
                }
            });
        });
    };

    this.getTicket = async (id) => {
        const _this = this;
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], async (err, row) => {
                if (err) {
                    reject(err);
                }
                if (!row) {
                    resolve(null);
                }
                try {
                    let ticket = {
                        id: row?.id,
                        title: row?.title,
                        category: row?.category,
                        state: row?.state,
                        owner: row?.owner,
                        timestamp: dayjs.unix(row?.timestamp).format(dateFormat),
                    };

                    let textBlocks = await _this.TextBlockDto.getTextBlocks(id);
                    ticket.textBlocks = textBlocks;

                    resolve(ticket);

                } catch (err) {
                    reject(err);
                }

            });
        });
    };


    this.__insertTicket = async (ticket) => {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO ${this.tableName} (title, category, state, owner, timestamp) VALUES (?, ?, ?, ?, ?)`,
                [ticket.title, ticket.category, ticket.state, ticket.owner, ticket.timestamp],
                async function (err) {
                    if (err) {
                        reject(err);
                    }
                    let result = {
                        id: this.lastID,
                        title: ticket.title,
                        category: ticket.category,
                        state: ticket.state,
                        owner: ticket.owner,
                        timestamp: dayjs.unix(ticket.timestamp).format(dateFormat),

                    };
                    resolve(result);
                });
        });

    }

    this.createTicket = async (ticket) => {
        return new Promise((resolve, reject) => {
            this.db.serialize(async () => {
                try {
                    await dbManager.openTransaction(this.db);
                    ticket.timestamp = dayjs().unix();
                    let result = await this.__insertTicket(ticket);
                    let textBlock = {
                        text: ticket.text,
                        timestamp: ticket.timestamp,
                        owner: ticket.owner,
                        ticket_id: result.id
                    }
                    textBlock = await this.TextBlockDto.createTextBlock(textBlock);
                    result.textBlocks = [textBlock];
                    await dbManager.commitTransaction(this.db);
                    resolve(result);
                } catch (err) {
                    await dbManager.rollbackTransaction(this.db);
                    reject(err);
                }
            });

        });
    };

    this.updateTicketStatus = async (id, state) => {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.tableName} SET  state = ? WHERE id = ?`,
                [state, id],
                function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                });
        });
    };

    this.updateTicketCategory = async (id, category) => {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.tableName} SET category = ? WHERE id = ?`,
                [category, id],
                function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                });
        });
    };

    this.searchTickets = async (searchWord, page, size, sortBy, order) => {
        let query = "";
        if (!sortBy) {
            sortBy = 'id';
        }
        if (!order) {
            order = 'ASC';
        }

        let condition = `WHERE LOWER(title) LIKE '%${searchWord}%' OR LOWER(category) LIKE '%${searchWord}%' OR LOWER(owner) LIKE '%${searchWord}%' OR LOWER(state) LIKE '%${searchWord}%' OR id LIKE '%${searchWord}%'`;

        if (!page || !size) {
            query = `SELECT * FROM ${this.tableName} ${condition} ORDER BY ${sortBy} ${order}`;
            logger.info(`Query: ${query}`);
        }
        else {
            query = `SELECT * FROM ${this.tableName} ${condition} ORDER BY ${sortBy} ${order} LIMIT ${size} OFFSET ${page * size}`;
            logger.info(`Query: ${query}`);
        }

        return new Promise((resolve, reject) => {
            let tickets = [];
            this.db.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    for (let row of rows) {
                        let ticket = {
                            id: row?.id,
                            title: row?.title,
                            category: row?.category,
                            state: row?.state,
                            owner: row?.owner,
                            timestamp: dayjs.unix(row?.timestamp).format(dateFormat),

                        };
                        tickets.push(ticket);
                    }
                    resolve(tickets);
                }
            });
        });

    };
}

module.exports = TicketDto; 