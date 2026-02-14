import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Checking Razorpay Configuration...');
console.log('KEY_ID Present:', !!process.env.RAZORPAY_KEY_ID);
console.log('KEY_SECRET Present:', !!process.env.RAZORPAY_KEY_SECRET);

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        console.log('✅ Razorpay initialized successfully.');

        // Try creating an order
        console.log('Items: Attempting to create a test order...');
        const options = {
            amount: 50000,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11"
        };
        const order = await razorpay.orders.create(options);
        console.log('✅ Order created successfully:', order);
    } catch (error) {
        console.error('❌ Error with Razorpay:', error);
    }
} else {
    console.error('❌ Razorpay keys missing in .env');
}

