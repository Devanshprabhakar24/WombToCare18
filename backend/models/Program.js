// Program model
import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
    programName: {
        type: String,
        required: [true, 'Program name is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Program name must be at least 3 characters long'],
        maxlength: [200, 'Program name cannot exceed 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Program description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    fundsReceived: {
        type: Number,
        default: 0,
        min: [0, 'Funds received cannot be negative'],
    },
    targetAmount: {
        type: Number,
        default: 0,
        min: [0, 'Target amount cannot be negative'],
    },
    fundsUtilized: {
        type: Number,
        default: 0,
        min: [0, 'Funds utilized cannot be negative'],
        validate: {
            validator: function (value) {
                return value <= this.fundsReceived;
            },
            message: 'Funds utilized cannot exceed funds received',
        },
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
        validate: {
            validator: function (value) {
                if (value) {
                    return value > this.startDate;
                }
                return true;
            },
            message: 'End date must be after start date',
        },
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'completed', 'archived'],
            message: 'Status must be active, completed, or archived',
        },
        default: 'active',
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
programSchema.index({ programName: 1 });
programSchema.index({ status: 1 });

// Utilization virtual
programSchema.virtual('utilizationRate').get(function () {
    if (this.fundsReceived === 0) return 0;
    return (this.fundsUtilized / this.fundsReceived) * 100;
});

// Virtuals in JSON
programSchema.set('toJSON', { virtuals: true });
programSchema.set('toObject', { virtuals: true });

const Program = mongoose.model('Program', programSchema);

export default Program;
