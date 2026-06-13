import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/consultation-manager';
    console.log(`Connecting to MongoDB at: ${connStr}...`);
    await mongoose.connect(connStr);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('The server will continue to run, but database actions will fail. Please make sure MongoDB is running or configure MONGODB_URI in your .env file.');
  }
};
