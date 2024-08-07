`use strict`;

const usersDto = function (db) {

    this.tableName = 'User';
    if (!db) {
        throw new Error('Database not found');
    }
    this.db = db;

    this.getAll = async () => {
        return new Promise((resolve, reject) => {
            let users = [];
            this.db.all(`SELECT * FROM ${this.tableName}`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    for (let row of rows) {
                        let user = {
                            id: row?.id,
                            username: row?.username,
                            role: row?.role,    
                            email: row?.email
                        };
                        users.push(user);
                        resolve(users);
                    }
                }
            });
        });
    };


    this.getUserById = async (id) => {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let user = {
                        id: row?.id,
                        username: row?.username,
                        role: row?.role,
                        email: row?.email
                    };
                    resolve(user);
                }
            });
        });
    }

    this.getUserByUsername = async (username) => {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE username = ?`, [username], function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let user = {
                        id: row?.id,
                        username: row?.username,
                        role: row?.role,    
                        email: row?.email,
                        password : row?.password,
                        salt: row?.salt
                    };
                    resolve(user);
                }
            });
        });
    }; 


    this.getUserByEmail = async (email) => { 
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE email = ?`, [email], function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    let user = {
                        id: row?.id,
                        username: row?.username,
                        role: row?.role,    
                        email: row?.email,
                        password : row?.password, 
                        salt: row?.salt     
                    };
                    resolve(user);
                }
            });
        }); 
     };


    this.createUser = async (user) => {
        const _this = this;
        return new Promise(async(resolve, reject) => {
            this.db.run(`INSERT INTO ${_this.tableName} (username, email, password, salt,  role) VALUES (?, ?, ?, ?, ?)`, [user.username, user.email, user.password, user.salt, user.role], async function (err) {
                if (err) {
                    reject(err);
                } else {
                    let response = {
                        id: this.lastID,
                        username: user.username,
                        role: user.role,
                        email: user.email
                    };

                    resolve(response);
                }
            });
        });
    };


    this.updateUser = async (user) => {

        const _this = this;

        let updateString = ``;
        let updateKeys = []
        let values = [];

        for (let key in user) {
            if (user[key] && key !== 'id' && key !== 'password' && key !== 'salt') {
                updateKeys.push(`${key} = ?`);
                values.push(user[key]);
            }
        }

        updateString = updateKeys.join(', ');

        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${_this.tableName} SET ${updateString} WHERE id=?`, [...values, user.id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });
    };


    this.deleteUser = async (id) => {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(id);
                }
            });
        });
    }; 

    this.updatePassword = async (user) => {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.tableName} SET password = ?, salt = ? WHERE id = ?`, [user.password, user.salt, user.id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }; 
}




module.exports = usersDto;    