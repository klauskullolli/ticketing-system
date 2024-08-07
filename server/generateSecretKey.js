`use strict`; 
const {generateRandom} = require('./utils/security');

const secretKey = generateRandom(128);

console.log(secretKey); 



