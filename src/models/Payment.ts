import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FreelanceInvoice'
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'bank_transfer'],
        required: true
    },
    transactionId: String
}, {
    timestamps: true
});

paymentSchema.index({ userId: 1 });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ subscriptionId: 1 });

paymentSchema.methods = {
    async generateReceipt() {
        const receipt = await mongoose.model('Receipt').create({
            freelancerId: this.userId,
            clientId: (await this.getInvoice())?.clientId,
            paymentId: this._id,
            receiptNumber: `R-${Date.now()}`,
            date: this.date,
            amount: this.amount
        });
        return receipt;
    },

    async getInvoice() {
        return await mongoose.model('FreelanceInvoice').findById(this.invoiceId);
    }
};

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema); 