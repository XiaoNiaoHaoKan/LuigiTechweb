import "dotenv/config";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGO_URI ||
      //"mongodb://127.0.0.1:27017/site252614";
	  "mongodb://127.0.0.1:27017/artaround";

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log("MongoDB connected:", mongoose.connection.host);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export { connectDB };