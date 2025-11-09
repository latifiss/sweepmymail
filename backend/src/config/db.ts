import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI || "";
let isConnected = false;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    console.log('⚙️  MongoDB already connected');
    return;
  }

  // Check if MONGO_URI is provided
  if (!uri || uri.trim() === "") {
    const error = new Error('MONGO_URI environment variable is not set. Please create a .env file with MONGO_URI=mongodb://localhost:27017/freemymail');
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('💡 Create a .env file in the backend directory with:');
    console.error('   MONGO_URI=mongodb://localhost:27017/freemymail');
    isConnected = false;
    throw error;
  }

  // Validate URI format
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    const error = new Error(`Invalid MONGO_URI format. Expected to start with "mongodb://" or "mongodb+srv://", got: ${uri}`);
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('💡 Valid examples:');
    console.error('   mongodb://localhost:27017/freemymail');
    console.error('   mongodb+srv://username:password@cluster.mongodb.net/freemymail');
    isConnected = false;
    throw error;
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'mrm',
    });

    isConnected = true;
    console.log('✅ MongoDB connection successful');
  } catch (err: unknown) {
    const error = err as Error;
    console.error('❌ MongoDB connection failed:', error.message);
    isConnected = false;
    throw err;
  }
}

function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('🟢 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('🟡 Mongoose disconnected');
});

export { connectDB, isDBConnected, mongoose };
