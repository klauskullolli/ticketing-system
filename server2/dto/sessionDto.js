`use strict`;

const SessionDto = function (db) {
    if (!db) {
        throw new Error('Database is mandatory');
    }
    this.db = db;
    this.tableName = 'Session';

    this.createSession = async (username, token) => {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO ${this.tableName} (token, username) VALUES (?, ?)`, [token, username], function (err) {
                if (err) {
                    reject(err);
                }
                resolve(this.lastID);
            });
        });
    };

    this.existSession = async (username) => {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE username = ?`, [username], function (err, row) {
                if (err) {
                    reject(err);
                }
                if (!row) {
                    resolve(false);
                }
                resolve(true);
            });
        });
    };

    this.getSession = async (username) => {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE username = ?`, [username], function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let session = {
                        id: row?.id,
                        token: row?.token,
                        username: row?.username
                    };
                    resolve(session);
                }
            });
        });
    };

    this.updateSession = async (username, token) => {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.tableName} SET token = ? WHERE username = ?`, [token, username], function (err) {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }


    this.deleteSession = async (username) => {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${this.tableName} WHERE username = ?`, [username], function (err) {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    };
};


module.exports = SessionDto;    