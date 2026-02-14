import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    programId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: [true, 'Program ID is required'],
    },
    fundsReceived: {
        type: Number,
        required: [true, 'Funds received is required'],
        min: [0, 'Funds received cannot be negative'],
    },
    fundsUtilized: {
        type: Number,
        required: [true, 'Funds utilized is required'],
        min: [0, 'Funds utilized cannot be negative'],
        validate: {
            validator: function (value) {
                return value <= this.fundsReceived;
            },
            message: 'Funds utilized cannot exceed funds received',
        },
    },
    reportFileURL: {
        type: String,
        required: [true, 'Report file URL is required'],
        trim: true,
    },
    lastUpdated: {
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

// Indexes for faster queries
reportSchema.index({ programId: 1 });
reportSchema.index({ lastUpdated: -1 }); // For sorting by most recent

// Update lastUpdated before saving
reportSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
