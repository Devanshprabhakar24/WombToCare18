// Donation model
import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Donation amount is required'],
        min: [1, 'Donation amount must be at least 1'],
    },
    razorpayPaymentId: {
        type: String,
        unique: true,
        sparse: true, // sparse is needed for unique index to ignore nulls
    },
    razorpayOrderId: {
        type: String,
        required: [true, 'Razorpay order ID is required'],
    },
    transactionStatus: {
        type: String,
        enum: {
            values: ['pending', 'completed', 'failed'],
            message: 'Transaction status must be pending, completed, or failed',
        },
        default: 'pending',
    },
    visibilityChoice: {
        type: String,
        enum: {
            values: ['public', 'anonymous'],
            message: 'Visibility choice must be public or anonymous',
        },
        required: [true, 'Visibility choice is required'],
    },
    publicName: {
        type: String,
        trim: true,
        maxlength: [100, 'Public name cannot exceed 100 characters'],
        // If public
        validate: {
            validator: function (value) {
                if (this.visibilityChoice === 'public') {
                    return value && value.length > 0;
                }
                return true;
            },
            message: 'Public name is required when visibility choice is public',
        },
    },
    donorId: {
        type: String,
        trim: true,
        // If anonymous
        validate: {
            validator: function (value) {
                if (this.visibilityChoice === 'anonymous') {
                    return value && value.length > 0;
                }
                return true;
            },
            message: 'Donor ID is required when visibility choice is anonymous',
        },
    },
    programId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: [true, 'Program ID is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Indexes
donationSchema.index({ userId: 1 });
donationSchema.index({ programId: 1 });
donationSchema.index({ razorpayPaymentId: 1 });
donationSchema.index({ createdAt: -1 }); // Sort by date

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
