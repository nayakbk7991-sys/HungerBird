import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import restaurantRouter from "./routes/restaurant.route.js";
import cors from 'cors'
dotenv.config()

import express from "express";
const app = express()

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://restraunt-pi-eight.vercel.app"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ success: "true", message: "welcome to restraunt api" })
})

import userRouter from './routes/user.route.js'
import adminRouter from './routes/admin.route.js'
import dishRouter from './routes/dish.route.js'
import orderRouter from "./routes/order.route.js";
app.use('/user/', userRouter)
app.use('/admin/', adminRouter)
app.use('/dish/', dishRouter)
app.use("/order", orderRouter);
app.use("/restaurant", restaurantRouter);

await connectDB()
const PORT = process.env.PORT
app.listen(PORT, () => console.log(`server is live at port ${PORT}`))

