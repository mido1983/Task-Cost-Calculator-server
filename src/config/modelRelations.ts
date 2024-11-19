export const modelRelations = {
    User: {
        hasOne: ['Subscription'],
        belongsTo: ['Company'],
        hasMany: ['FreelanceClient', 'FreelanceInvoice', 'Payment', 'AuditLog', 'Notification']
    },
    Company: {
        hasMany: ['User', 'Account', 'Transaction', 'Report']
    },
    FreelanceClient: {
        belongsTo: ['User'],
        hasMany: ['FreelanceInvoice']
    },
    FreelanceInvoice: {
        belongsTo: ['User', 'FreelanceClient'],
        hasMany: ['Payment']
    },
    Payment: {
        belongsTo: ['User', 'FreelanceInvoice', 'Subscription'],
        hasOne: ['Receipt']
    },
    Account: {
        belongsTo: ['Company', 'Account'],
        hasMany: ['Transaction']
    },
    Transaction: {
        belongsTo: ['Company', 'User'],
        hasMany: ['Account']
    }
}; 