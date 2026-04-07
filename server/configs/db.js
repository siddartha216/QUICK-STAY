import mongoose from "mongoose";

const connectDB = async () => {
  try {

    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected");
    });

    mongoose.connection.on("error", (err) => {
      console.log("❌ MongoDB error:", err);
    });

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "test",
    });

  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;