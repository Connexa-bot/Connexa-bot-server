import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('📦 MongoDB already connected');
    return;
  }

  if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not found in environment variables. Running without database.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📡 MongoDB disconnected');
      isConnected = false;
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.warn('⚠️  Running without database - data will not persist');
  }
};

export const isDBConnected = () => isConnected;

export default connectDB;
