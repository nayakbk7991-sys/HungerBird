
import mongoose from "mongoose";

const dishSchema = new mongoose.Schema({
  dishName: { type: String },
  name: { type: String },
  category: { type: String, required: true },
  imgSrc: { type: String },
  image: { type: String },
  price: { type: Number, required: true },
  description: { type: String },
  restaurant: { type: String },
  isVeg: { type: Boolean },
  isAvailable: { type: Boolean },
});

export const Dish = mongoose.model("Dish", dishSchema, "foods");
