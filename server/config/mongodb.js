import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URI;

export const connectDB = async () => {
  if (!MONGODB_URL) {
    console.error("MONGODB_URI is not set. Copy server/.env.example to server/.env and add your MongoDB connection string.");
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
