import mongoose from 'mongoose';

const freelanceClientSchema = new mongoose.Schema({
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: String,
    address: String,
    companyName: String,
    taxId: String
}, {
    timestamps: true
});

freelanceClientSchema.index({ freelancerId: 1 });
freelanceClientSchema.index({ email: 1 });

export const FreelanceClient = mongoose.models.FreelanceClient || mongoose.model('FreelanceClient', freelanceClientSchema); 