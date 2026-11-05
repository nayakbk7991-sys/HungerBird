
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";
import userRouter from "./routes/user.route.js";
import adminRouter from "./routes/admin.route.js";
import dishRouter from "./routes/dish.route.js";
import orderRouter from "./routes/order.route.js";
import restaurantRouter from "./routes/restaurant.route.js";
import deliveryRouter from "./routes/delivery.route.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://restraunt-pi-eight.vercel.app"
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to HungerBird API"
    });
});

app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/dish", dishRouter);
app.use("/order", orderRouter);
app.use("/restaurant", restaurantRouter);
app.use("/delivery", deliveryRouter);

const PORT = process.env.PORT || 5000;

try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`HungerBird server is running on port ${PORT}`);
        console.log("Network access enabled");
    });
} catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
}

