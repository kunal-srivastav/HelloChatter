import mongoose from "mongoose";

export const connectDB = async () => { 
    try {
    mongoose.connect(`${process.env.MONGODB_URI}/Whatsapp`);
    console.log("Database connected successfully");
    } catch (err) {
        console.log("Database connection failed:",err);
    }
}
