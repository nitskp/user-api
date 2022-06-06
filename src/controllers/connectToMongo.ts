import mongoose from "mongoose";

export const connectToMongo = async (databaseUrl: string) => {
  try {
    await mongoose.connect(databaseUrl);
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};
