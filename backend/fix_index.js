import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Donation from './models/Donation.js';

dotenv.config();

const fixIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const collection = Donation.collection;
        try {
            await collection.dropIndex('razorpayPaymentId_1');
            console.log('✅ Index razorpayPaymentId_1 dropped successfully.');
        } catch (error) {
            console.log('⚠️  Index might not exist or verify name:', error.message);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixIndex();
