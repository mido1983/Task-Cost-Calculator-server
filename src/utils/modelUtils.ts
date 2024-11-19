import mongoose from 'mongoose';

export const modelUtils = {
    async checkSubscriptionStatus(userId: string) {
        const user = await mongoose.model('User').findById(userId)
            .populate('subscriptionId');
        
        if (!user) throw new Error('User not found');

        const now = new Date();
        const subscription = user.subscriptionId;

        // Проверка пробного периода
        if (user.trialEndsAt > now) {
            return { status: 'trial', daysLeft: Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) };
        }

        // Проверка активной подписки
        if (subscription && subscription.isActive && subscription.endDate > now) {
            return { 
                status: 'active', 
                type: subscription.accountType,
                daysLeft: Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            };
        }

        return { status: 'inactive' };
    },

    async createAuditLog(
        action: string,
        entity: string,
        entityId: string,
        userId: string,
        details: any,
        ipAddress: string
    ) {
        return await mongoose.model('AuditLog').create({
            userId,
            action,
            entity,
            entityId,
            details,
            ipAddress
        });
    },

    async sendNotification(
        userId: string,
        type: string,
        message: string,
        relatedEntity: string | null = null,
        relatedEntityId: string | null = null
    ) {
        return await mongoose.model('Notification').create({
            userId,
            type,
            message,
            relatedEntity,
            relatedEntityId
        });
    }
}; 