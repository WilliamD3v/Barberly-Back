require("dotenv").config();
import mongoose from "mongoose";

export const databaseConnection = async () => {
  if(!global.mongoose) {
    mongoose.set('strictQuery', false)
    global.mongoose = await mongoose.connect(process.env.URI)
  }

  console.log(process.env.URI);
}

