`use strict`;

ROLES = {
    ADMIN: 'admin',
    USER: 'user'
};


TICKET_STATUS = {
    OPEN: 'open',
    CLOSED: 'closed'
};

TICKET_CATEGORY = {
    INQUIRY: 'inquiry',
    MAINTENANCE: 'maintenance',
    NEW_FEATURE: 'new feature',
    ADMINISTRATIVE: 'administrative', 
    PAYMENT : 'payment'  
};


module.exports = { ROLES, TICKET_STATUS, TICKET_CATEGORY};    