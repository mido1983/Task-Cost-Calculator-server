import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FreelanceClient',
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },
    receiptNumber: {
        type: String,
        required: true,
        unique: true
    },
    dateIssued: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

receiptSchema.index({ freelancerId: 1 });
receiptSchema.index({ clientId: 1 });
receiptSchema.index({ paymentId: 1 });
receiptSchema.index({ receiptNumber: 1 }, { unique: true });

export const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', receiptSchema); 