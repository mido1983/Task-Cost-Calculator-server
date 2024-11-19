import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6
    },
    planType: {
        type: String,
        enum: ['paid-5', 'paid-10', 'paid-15'],
        default: 'paid-5'
    },
    role: {
        type: String,
        enum: ['admin', 'moderator', 'user'],
        default: 'user'
    },
    subscriptionStartDate: {
        type: Date,
        default: Date.now
    },
    subscriptionEndDate: {
        type: Date
    },
    trialEndsAt: {
        type: Date,
        required: true
    },
    paymentInfo: {
        lastPaymentDate: Date,
        paymentMethod: String,
        paymentStatus: {
            type: String,
            enum: ['active', 'pending', 'failed', 'cancelled'],
            default: 'pending'
        },
        paymentHistory: [{
            amount: Number,
            date: Date,
            status: String,
            transactionId: String
        }]
    },
    teamMembers: [{
        email: String,
        role: {
            type: String,
            enum: ['owner', 'admin', 'member'],
            default: 'member'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    permissions: {
        canManageTeam: {
            type: Boolean,
            default: false
        },
        canManageBilling: {
            type: Boolean,
            default: false
        },
        canAccessReports: {
            type: Boolean,
            default: true
        },
        customPermissions: [String]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true // Автоматически добавляет createdAt и updatedAt
});

// Индексы для оптимизации запросов
userSchema.index({ email: 1 });
userSchema.index({ planType: 1 });
userSchema.index({ 'teamMembers.email': 1 });

// Виртуальное свойство для проверки активности пробного периода
userSchema.virtual('isTrialActive').get(function() {
    return this.trialEndsAt > new Date();
});

// Виртуальное свойство для проверки активности подписки
userSchema.virtual('isSubscriptionActive').get(function() {
    return this.subscriptionEndDate ? this.subscriptionEndDate > new Date() : false;
});

// Метод для проверки доступа
userSchema.methods.hasPermission = function(permission: string) {
    return this.permissions.customPermissions.includes(permission) ||
           this.permissions[permission] === true;
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);