import mongoose from 'mongoose';

export const notificationUtils = {
    async checkAndCreatePaymentReminders() {
        const overdueInvoices = await mongoose.model('FreelanceInvoice').find({
            status: { $ne: 'paid' },
            dueDate: { $lt: new Date() }
        });

        for (const invoice of overdueInvoices) {
            await mongoose.model('Notification').create({
                userId: invoice.freelancerId,
                type: 'payment_due',
                message: `Payment overdue for invoice #${invoice.invoiceNumber}`,
                relatedEntity: 'invoice',
                relatedEntityId: invoice._id
            });
        }
    },

    async checkAndCreateSubscriptionReminders() {
        const nearExpirySubscriptions = await mongoose.model('Subscription').find({
            endDate: {
                $gt: new Date(),
                $lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            },
            isActive: true
        });

        for (const subscription of nearExpirySubscriptions) {
            await mongoose.model('Notification').create({
                userId: subscription.userId,
                type: 'subscription_expiring',
                message: `Your subscription will expire in ${Math.ceil((subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`,
                relatedEntity: 'subscription',
                relatedEntityId: subscription._id
            });
        }
    }
}; 