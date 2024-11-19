import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    description: String,
    entries: [{
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        },
        debit: Number,
        credit: Number
    }],
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    attachments: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

transactionSchema.index({ companyId: 1, date: 1 });
transactionSchema.index({ createdBy: 1 });

interface ITransactionDocument extends mongoose.Document {
    validateEntries(): Promise<boolean>;
    updateAccountBalances(): Promise<void>;
    entries: Array<{ debit?: number; credit?: number; accountId: mongoose.Types.ObjectId }>;
    createdBy: mongoose.Types.ObjectId;
    description?: string;
}

transactionSchema.methods = {
    async validateEntries() {
        type Entry = { debit?: number; credit?: number };
        const totalDebit = this.entries.reduce((sum: number, entry: Entry) => sum + (entry.debit || 0), 0);
        const totalCredit = this.entries.reduce((sum: number, entry: Entry) => sum + (entry.credit || 0), 0);
        return Math.abs(totalDebit - totalCredit) < 0.01;
    },

    async updateAccountBalances() {
        type Entry = { accountId: mongoose.Types.ObjectId };
        const accounts = new Set(this.entries.map((entry: Entry) => entry.accountId));
        for (const accountId of accounts) {
            const account = await mongoose.model('Account').findById(accountId);
            await account.calculateBalance();
        }
    }
};

transactionSchema.pre<ITransactionDocument>('save', async function(next) {
    if (!(await this.validateEntries())) {
        throw new Error('Transaction entries must balance (total debit = total credit)');
    }
    next();
});

transactionSchema.post<ITransactionDocument>('save', async function() {
    await this.updateAccountBalances();
    
    // Create audit log
    await mongoose.model('AuditLog').create({
        userId: this.createdBy,
        action: this.isNew ? 'create' : 'update',
        entity: 'Transaction',
        entityId: this._id,
        details: {
            amount: this.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0),
            description: this.description
        }
    });
});

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema); 