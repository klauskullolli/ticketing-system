`use strict`;

const config = {
    port: 3002, 
    host: 'localhost', 
    adminFormat: 'YYYY-MM-DD HH',
    userFormat: 'YYYY-MM-DD', 
    dbUrl: '../server/resources/ticket_system.db',
    jwtSecret: 'O+nFZpHmhvn6HQRquwm90zlXpwNm7dQwm/LEbyEmTBzIUOX4vhr7aleaQtRMft30f9MiBzhnA3zbc1nSENVOsbAKE8SLAqEKz7/thpJyymRY74L1cfgQ4TS0ee1c8t5f1d4ffVKVyL9G0oDRrT4cEN2LzwKw8WHQncDT299DNB4=', 
    jwtExpiration: 3600, 
    corsOptions: {
        origin: "http://localhost:5173",
        credentials: true
    }    

}; 


module.exports =  config; 