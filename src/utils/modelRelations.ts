import mongoose from "mongoose";

interface User {
    getSubscription(): Promise<any>;
    getCompany(): Promise<any>;
    getClients(): Promise<any>;
    getInvoices(): Promise<any>;
}

export const modelRelations = {
    async loadUserRelations(user: User) {
        return {
            subscription: await user.getSubscription(),
            company: await user.getCompany(),
            clients: await user.getClients(),
            invoices: await user.getInvoices()
        };
    },

    async loadInvoiceRelations(invoice: any) {
        return {
            client: await mongoose.model('FreelanceClient').findById(invoice.clientId),
            payments: await invoice.getPayments(),
            freelancer: await mongoose.model('User').findById(invoice.freelancerId)
        };
    },

    async loadCompanyRelations(company: any) {
        return {
            users: await company.getUsers(),
            accounts: await company.getAccounts(),
            transactions: await company.getTransactions()
        };
    }
}; 