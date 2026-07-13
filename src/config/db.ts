import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connection successfull");
    });

    mongoose.connection.on("error", () => {
      console.log("Error connection to database");
    });
    await mongoose.connect(config.databaseUrl as string);
  } catch (error) {
    console.log("Failed to connect to database", error);
    process.exit(1);
  }
};

export default connectDB;
