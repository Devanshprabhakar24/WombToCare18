import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Donation from './models/Donation.js';

dotenv.config();

const checkIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const indexes = await Donation.collection.indexes();
        const paymentIdIndex = indexes.find(idx => idx.name === 'razorpayPaymentId_1' || (idx.key && idx.key.razorpayPaymentId));
        console.log('RazorpayPaymentId Index:', JSON.stringify(paymentIdIndex, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkIndexes();
