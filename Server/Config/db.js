// import mongoose from "mongoose";

// const connectDB = async () => {
    // try {
        // const uri = "mongodb://site252614:Oejachu0@mongo_site252614:27017/site252614?authSource=admin";

        // await mongoose.connect(uri);

        // console.log("MongoDB connected");
    // } catch (error) {
        // console.error("MongoDB connection error:", error.message);
        // process.exit(1);
    // }
// };

// export { connectDB };

// import "dotenv/config";
// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     const uri =
//       process.env.MONGO_URI ||
//       "mongodb://site252614:Oejachu0@mongo_site252614:27017/site252614?authSource=admin";

//     await mongoose.connect(uri, {
//       serverSelectionTimeoutMS: 5000
//     });

//     console.log("MongoDB connected:", mongoose.connection.host);
//   } catch (error) {
//     console.error("MongoDB connection error:", error.message);
//     process.exit(1);
//   }
// };

//export { connectDB };
import "dotenv/config";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/site252614";

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