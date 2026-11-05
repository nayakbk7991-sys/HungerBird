
import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import { Dish } from "../models/Dishes.model.js";

export const placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod = "COD" } = req.body;
    const userId = req.user?.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Please log in again.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one food item.",
      });
    }

    if (!deliveryAddress?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required.",
      });
    }

    if (!["COD", "Online"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const foodId = item.foodId;
      const quantity = Number(item.quantity);

      if (
        !mongoose.isValidObjectId(foodId) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
      ) {
        return res.status(400).json({
          success: false,
          message: "A food item or quantity is invalid.",
        });
      }

      const food = await Dish.findById(foodId);

      if (!food) {
        return res.status(400).json({
          success: false,
          message: "A selected food item could not be found.",
        });
      }

      const name = food.dishName || food.name;
      const price = Number(food.price);

      if (!name || !Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "A selected food item has invalid details.",
        });
      }

      orderItems.push({
        foodId: food._id,
        name,
        price,
        quantity,
      });

      totalAmount += price * quantity;
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      paymentStatus: "Pending",
      orderStatus: "Confirmed",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Place order error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to place your order.",
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Please log in again.",
      });
    }

    const orders = await Order.find({ user: userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch your orders.",
    });
  }
};
