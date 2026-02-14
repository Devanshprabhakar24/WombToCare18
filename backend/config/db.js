// DB connect
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Check if MongoDB URI is provided
        if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'mongodb://localhost:27017/nonprofit-donation') {
            console.warn('⚠️  MongoDB connection string not configured!');
            console.warn('⚠️  Please update MONGODB_URI in backend/.env file');
            console.warn('⚠️  Get your connection string from MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
            console.warn('⚠️  Server will start but database operations will fail');
            return;
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.warn('⚠️  Server will start but database operations will fail');
        console.warn('⚠️  Please check your MONGODB_URI in backend/.env file');
    }
};

export default connectDB;
