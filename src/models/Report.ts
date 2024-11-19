import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reportType: {
        type: String,
        enum: ['balance', 'profit_loss', 'cash_flow'],
        required: true
    },
    dateGenerated: {
        type: Date,
        default: Date.now
    },
    data: mongoose.Schema.Types.Mixed,
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, {
    timestamps: true
});

reportSchema.methods = {
    async generateBalanceSheet() {
        const accounts = await mongoose.model('Account').find({ 
            companyId: this.companyId 
        });
        
        const balanceSheet: {
            assets: { [key: string]: number },
            liabilities: { [key: string]: number },
            equity: { [key: string]: number },
            totalAssets: number,
            totalLiabilities: number,
            totalEquity: number
        } = {
            assets: {},
            liabilities: {},
            equity: {},
            totalAssets: 0,
            totalLiabilities: 0,
            totalEquity: 0
        };

        for (const account of accounts) {
            await account.calculateBalance();
            switch(account.type) {
                case 'asset':
                    balanceSheet.assets[account.name] = account.balance;
                    balanceSheet.totalAssets += account.balance;
                    break;
                case 'liability':
                    balanceSheet.liabilities[account.name] = account.balance;
                    balanceSheet.totalLiabilities += account.balance;
                    break;
                case 'equity':
                    balanceSheet.equity[account.name] = account.balance;
                    balanceSheet.totalEquity += account.balance;
                    break;
            }
        }
        
        this.data = balanceSheet;
        await this.save();
        return balanceSheet;
    },

    async generateProfitLoss(startDate: Date, endDate: Date) {
        const transactions = await mongoose.model('Transaction').find({
            companyId: this.companyId,
            date: { $gte: startDate, $lte: endDate }
        });

        const profitLoss = {
            income: {},
            expenses: {},
            totalIncome: 0,
            totalExpenses: 0,
            netProfit: 0
        };

        // Логика расчета прибылей и убытков
        this.data = profitLoss;
        await this.save();
        return profitLoss;
    }
};

reportSchema.index({ companyId: 1, reportType: 1 });
reportSchema.index({ dateGenerated: 1 });

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema); 