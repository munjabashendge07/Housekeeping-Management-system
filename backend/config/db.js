
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URL;

    if (!mongoUri) {
      throw new Error("MONGO_URL is missing in environment variables");
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
