import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv()
const url = process.env.MONGO_URI
if (!url) { console.log("uri is missing in env") }

export const connectDB = async () => {

    try {
       await mongoose.connect(url, { dbName: "hungerbird" })
        console.log("database connected successfully")
    } catch (error) {
        console.log("database connected successfully")

    }

}

