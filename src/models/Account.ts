import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
    accountNumber: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['asset', 'liability', 'income', 'expense'],
        required: true
    },
    parentAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    balance: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

accountSchema.index({ companyId: 1, accountNumber: 1 }, { unique: true });
accountSchema.index({ parentAccountId: 1 });

accountSchema.methods = {
    async getTransactions(startDate?: Date, endDate?: Date) {
        const query: { 
            'entries.accountId': any;
            date?: {
                $gte?: Date;
                $lte?: Date;
            };
        } = { 
            'entries.accountId': this._id 
        };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }
        return await mongoose.model('Transaction').find(query);
    },

    async calculateBalance() {
        const transactions = await this.getTransactions();
        let balance = 0;
        
        transactions.forEach((transaction: any) => {
            transaction.entries.forEach((entry: { accountId: mongoose.Types.ObjectId; debit?: number; credit?: number }) => {
                if (entry.accountId.equals(this._id)) {
                    balance += (entry.debit || 0) - (entry.credit || 0);
                }
            });
        });
        
        this.balance = balance;
        await this.save();
        return balance;
    },

    async getChildAccounts() {
        return await mongoose.model('Account').find({ parentAccountId: this._id });
    }
};

accountSchema.index({ companyId: 1, accountNumber: 1 }, { unique: true });
accountSchema.index({ companyId: 1, type: 1 });
accountSchema.index({ parentAccountId: 1, type: 1 });

export const Account = mongoose.models.Account || mongoose.model('Account', accountSchema); 