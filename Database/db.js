import mongoose from "mongoose";

export const connectdb=async()=>{
    try {
        await mongoose.connect(process.env.DB)
        console.log("connected")
    } catch (error) {
        console.log(error)
    }
}