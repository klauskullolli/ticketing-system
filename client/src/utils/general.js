`use strict`;

const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
};


const TICKET_STATUS = {
    OPEN: 'open',
    CLOSED: 'closed'
};

const TICKET_CATEGORY = {
    INQUIRY: 'inquiry',
    MAINTENANCE: 'maintenance',
    NEW_FEATURE: 'new feature',
    ADMINISTRATIVE: 'administrative',
    PAYMENT: 'payment'
};

export { ROLES, TICKET_STATUS, TICKET_CATEGORY };