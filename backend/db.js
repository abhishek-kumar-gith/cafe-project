import mongoose from "mongoose";

// const MONGO_URL =
// "mongodb+srv://aabhishek9876abhi_db_user:abhi123@cluster0.yeinzle.mongodb.net/cafeDB";
// ;


export async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    }catch(error){
        console.log("MongoDB Connection Failed",error);
        // process.exit(1);
    }
}