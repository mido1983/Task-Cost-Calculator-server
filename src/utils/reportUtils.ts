import mongoose from 'mongoose';
// @ts-ignore
import { formatCurrency } from './formatters';

type AccountType = 'assets' | 'liabilities' | 'equity';

interface TransactionEntry {
    accountId: {
        type: string;
        name: string;
    };
    credit: number;
    debit: number;
}

export const reportUtils = {
    async generateBalanceSheet(companyId: string) {
        const accounts = await mongoose.model('Account').find({ companyId });
        const balanceSheet: Record<AccountType | 'summary', any> = {
            assets: {},
            liabilities: {},
            equity: {},
            summary: {
                totalAssets: 0,
                totalLiabilities: 0,
                totalEquity: 0
            }
        };

        for (const account of accounts) {
            await account.calculateBalance();
            const accountType = account.type.toLowerCase() as AccountType;
            const section = balanceSheet[accountType];
            if (section) {
                section[account.name] = account.balance;
                balanceSheet.summary[`total${account.type.charAt(0).toUpperCase() + account.type.slice(1)}s`] += account.balance;
            }
        }

        return balanceSheet;
    },

    async generateProfitLossReport(companyId: string, startDate: Date, endDate: Date) {
        const transactions = await mongoose.model('Transaction')
            .find({
                companyId,
                date: { $gte: startDate, $lte: endDate }
            })
            .populate('entries.accountId');

        const report: {
            income: Record<string, number>;
            expenses: Record<string, number>;
            summary: {
                totalIncome: number;
                totalExpenses: number;
                netProfit: number;
            }
        } = {
            income: {},
            expenses: {},
            summary: {
                totalIncome: 0,
                totalExpenses: 0,
                netProfit: 0
            }
        };

        // Обработка транзакций
        transactions.forEach(transaction => {
            transaction.entries.forEach((entry: TransactionEntry) => {
                const account = entry.accountId;
                if (account.type === 'income') {
                    report.income[account.name] = (report.income[account.name] || 0) + entry.credit;
                    report.summary.totalIncome += entry.credit;
                } else if (account.type === 'expense') {
                    report.expenses[account.name] = (report.expenses[account.name] || 0) + entry.debit;
                    report.summary.totalExpenses += entry.debit;
                }
            });
        });

        report.summary.netProfit = report.summary.totalIncome - report.summary.totalExpenses;
        return report;
    }
}; 