const dayjs = require('dayjs');
const config = require('../config');
const { text } = require('express');

const dateFormat = config?.generalTimeFormat || 'YYYY-MM-DD HH:mm:ss';

const TextBlockDto = function (db) {
    if (!db) {
        throw new Error('Database is mandatory');
    }
    this.db = db;
    this.tableName = 'TextBlock';

    this.createTextBlock = async (textBlock) => {
        const _this = this;
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO ${_this.tableName} (text, timestamp, owner, ticket_id) VALUES (?, ?, ?, ?)`, [textBlock.text, textBlock.timestamp, textBlock.owner, textBlock.ticket_id], function (err) {
                if (err) {
                    reject(err);
                }
                textBlock = {
                    id: this.lastID,
                    text: textBlock.text,
                    timestamp: dayjs.unix(textBlock.timestamp).format(dateFormat),
                    owner: textBlock.owner,
                    ticket_id: textBlock.ticket_id
                }
                resolve(textBlock);
            });
        });
    };

    this.getTextBlocks = async (ticket_id) => {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.tableName} WHERE ticket_id = ?`, [ticket_id], (err, rows) => {
                if (err) {
                    reject(err);
                }
                let textBlocks = [];
                for (let row of rows) {
                    let textBlock = {
                        id: row?.id,
                        text: row?.text,
                        timestamp: dayjs.unix(row?.timestamp).format(dateFormat),
                        owner: row?.owner,
                        ticket_id: row?.ticket_id
                    };
                    textBlocks.push(textBlock);
                }
                resolve(textBlocks);
            });
        });
    };

    this.updateTextBlock = async (id, text) => {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.tableName} SET text = ? WHERE id = ?`, [text, id], function (err) {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }; 

    this.deleteTextBlock = async (id) => {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id], function (err) {
                if (err) {
                    reject(err);
                }
                resolve(id);
            });
        });
    };

    this.getTextBlock = async (id) => { 
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                if (!row) {
                    resolve(null);
                }
                let textBlock = {
                    id: row?.id,
                    text: row?.text,
                    timestamp: dayjs.unix(row?.timestamp).format(dateFormat),
                    owner: row?.owner,
                    ticket_id: row?.ticket_id
                };
                resolve(textBlock);
            });
        });
    }   

}


module.exports = TextBlockDto;  