import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['reminder', 'payment_due', 'subscription_expiring', 'system_alert'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    relatedEntity: {
        type: String,
        enum: ['invoice', 'payment', 'subscription', 'client']
    },
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true
});

notificationSchema.methods = {
    async markAsRead() {
        this.read = true;
        await this.save();
    },

    async getRelatedEntity() {
        if (!this.relatedEntity || !this.relatedEntityId) return null;
        return await mongoose.model(this.relatedEntity.charAt(0).toUpperCase() + 
                                  this.relatedEntity.slice(1))
                           .findById(this.relatedEntityId);
    }
};

notificationSchema.statics = {
    async createPaymentDueNotification(invoice) {
        return await this.create({
            userId: invoice.freelancerId,
            type: 'payment_due',
            message: `Payment due for invoice #${invoice.invoiceNumber}`,
            relatedEntity: 'invoice',
            relatedEntityId: invoice._id
        });
    },

    async createSubscriptionExpiringNotification(subscription) {
        const daysLeft = Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return await this.create({
            userId: subscription.userId,
            type: 'subscription_expiring',
            message: `Your subscription will expire in ${daysLeft} days`,
            relatedEntity: 'subscription',
            relatedEntityId: subscription._id
        });
    }
};

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ relatedEntity: 1, relatedEntityId: 1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema); 