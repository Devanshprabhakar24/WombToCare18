import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    donationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        required: [true, 'Donation ID is required'],
        unique: true,
    },
    certificateType: {
        type: String,
        enum: {
            values: ['80G', '12A'],
            message: 'Certificate type must be 80G or 12A',
        },
        default: '80G',
    },
    certificateURL: {
        type: String,
        required: [true, 'Certificate URL is required'],
        trim: true,
    },
    issuedDate: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: false,
});

// Index for faster lookups by donation
certificateSchema.index({ donationId: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
