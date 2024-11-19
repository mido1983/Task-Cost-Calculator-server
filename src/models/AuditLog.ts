import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['create', 'update', 'delete', 'login', 'export'],
        required: true
    },
    entity: {
        type: String,
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: String,
    details: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});

auditLogSchema.statics = {
    async logAction(userId, action, entity, entityId, details, ipAddress) {
        const log = await this.create({
            userId,
            action,
            entity,
            entityId,
            details,
            ipAddress,
            timestamp: new Date()
        });

        // Создаем уведомление для определенных действий
        if (['delete', 'update'].includes(action)) {
            await mongoose.model('Notification').create({
                userId,
                type: 'system_alert',
                message: `${action.toUpperCase()} operation performed on ${entity}`,
                read: false
            });
        }

        return log;
    },

    async getActivityReport(userId, startDate, endDate) {
        return await this.find({
            userId,
            timestamp: { $gte: startDate, $lte: endDate }
        }).sort({ timestamp: -1 });
    }
};

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema); 