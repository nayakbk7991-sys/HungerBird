import mongoose from "mongoose";

const dishSchema = new mongoose.Schema({
    dishName: { type: String, require: true },
    category: { type: String, require: true },
    imgSrc: { type: String, require: true },
    price: { type: Number, require: true },
    isVeg: { type: Boolean, },
    isAvailable: { type: Boolean, },
})
export const Dish = mongoose.model("Dish", dishSchema, "foods")