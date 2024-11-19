import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: String,
    taxId: String,
    settings: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

companySchema.index({ name: 1 });
companySchema.index({ taxId: 1 });

companySchema.methods = {
    async getUsers() {
        return await mongoose.model('User').find({
            _id: { $in: this.users }
        });
    },

    async getAccounts() {
        return await mongoose.model('Account').find({ companyId: this._id });
    },

    async getTransactions(startDate?: Date, endDate?: Date) {
        const query: { companyId: any; date?: { $gte?: Date; $lte?: Date } } = { companyId: this._id };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }
        return await mongoose.model('Transaction').find(query);
    }
};

// Добавляем составные индексы
companySchema.index({ name: 1, taxId: 1 }, { unique: true });
companySchema.index({ 'users': 1 });

export const Company = mongoose.models.Company || mongoose.model('Company', companySchema); 