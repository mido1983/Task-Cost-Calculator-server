import mongoose from 'mongoose';

const freelanceInvoiceSchema = new mongoose.Schema({
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
    invoiceNumber: {
        type: String,
        required: true
    },
    dateIssued: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    items: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['unpaid', 'partially_paid', 'paid'],
        default: 'unpaid'
    },
    paymentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }]
}, {
    timestamps: true
});

freelanceInvoiceSchema.index({ freelancerId: 1 });
freelanceInvoiceSchema.index({ clientId: 1 });
freelanceInvoiceSchema.index({ status: 1 });

freelanceInvoiceSchema.methods = {
    async getPayments() {
        return await mongoose.model('Payment').find({
            _id: { $in: this.paymentIds }
        });
    },

    async getTotalPaid() {
        const payments = await this.getPayments();
        return payments.reduce((sum: number, payment: { amount: number }) => sum + payment.amount, 0);
    },

    async updateStatus() {
        const totalPaid = await this.getTotalPaid();
        if (totalPaid >= this.totalAmount) {
            this.status = 'paid';
        } else if (totalPaid > 0) {
            this.status = 'partially_paid';
        } else {
            this.status = 'unpaid';
        }
        await this.save();
    }
};

// Добавляем составные индексы
freelanceInvoiceSchema.index({ freelancerId: 1, status: 1 });
freelanceInvoiceSchema.index({ clientId: 1, status: 1 });
freelanceInvoiceSchema.index({ dateIssued: 1, status: 1 });

export const FreelanceInvoice = mongoose.models.FreelanceInvoice || mongoose.model('FreelanceInvoice', freelanceInvoiceSchema); 