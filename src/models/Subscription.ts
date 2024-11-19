import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountType: {
        type: String,
        enum: ['paid-5', 'paid-10', 'paid-15'],
        required: true
    },
    features: [{
        type: String
    }],
    addOns: [{
        type: String
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    paymentHistory: [{
        date: Date,
        amount: Number,
        transactionId: String
    }]
}, {
    timestamps: true
});

subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ accountType: 1 });
subscriptionSchema.index({ isActive: 1 });

export const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema); 