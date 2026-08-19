import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

// Render/Atlas SRV lookups often fail when Node prefers IPv6
dns.setDefaultResultOrder("ipv4first");

export const connectDB = async () => {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    console.error("MONGODB_URI is not set. Add it in Render Environment, or in server/.env locally.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongodbUri, {
      family: 4,
      serverSelectionTimeoutMS: 15000
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    if (error.message?.includes("querySrv") || error.message?.includes("ENOTFOUND")) {
      console.error("Atlas SRV DNS lookup failed. In Atlas: Database > Connect, copy the mongodb+srv URI exactly.");
      console.error("The host must look like cluster0.xxxxx.mongodb.net — not the database name (e.g. mealexpress).");
      console.error("Also allow Render to reach Atlas: Network Access > Add IP Address > 0.0.0.0/0");
    }
    process.exit(1);
  }
};

export default connectDB;
