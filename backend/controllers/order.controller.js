
import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import { Dish } from "../models/Dishes.model.js";

export const placeOrder = async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      deliveryLocation,
      paymentMethod = "COD"
    } = req.body;

    const userId = req.user?.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Please log in again."
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one food item."
      });
    }

    if (
      typeof deliveryAddress !== "string" ||
      !deliveryAddress.trim() ||
      deliveryAddress.trim().length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid delivery address of up to 500 characters."
      });
    }

    if (!["COD", "Online"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method."
      });
    }

    if (paymentMethod === "Online") {
      return res.status(400).json({
        success: false,
        message:
          "Online payment is not available yet. Please select Cash on Delivery."
      });
    }

    let savedDeliveryLocation;

    if (deliveryLocation != null) {
      const latitude = deliveryLocation.latitude;
      const longitude = deliveryLocation.longitude;

      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "The selected delivery coordinates are invalid."
        });
      }

      savedDeliveryLocation = {
        latitude,
        longitude
      };
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const foodId = item?.foodId;
      const quantity = Number(item?.quantity);

      if (
        !mongoose.isValidObjectId(foodId) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
      ) {
        return res.status(400).json({
          success: false,
          message: "A food item or quantity is invalid."
        });
      }

      const food = await Dish.findById(foodId).lean();

      if (!food) {
        return res.status(400).json({
          success: false,
          message: "A selected food item could not be found."
        });
      }

      if (food.isAvailable === false) {
        return res.status(400).json({
          success: false,
          message: `${
            food.dishName || food.name || "A food item"
          } is currently unavailable.`
        });
      }

      const name = food.dishName || food.name;
      const price = Number(food.price);

      if (!name || !Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "A selected food item has invalid details."
        });
      }

      orderItems.push({
        foodId: food._id,
        name,
        price,
        quantity
      });

      totalAmount += price * quantity;
    }

    totalAmount =
      Math.round((totalAmount + Number.EPSILON) * 100) / 100;

    const orderData = {
      user: userId,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Confirmed"
    };

    if (savedDeliveryLocation) {
      orderData.deliveryLocation = savedDeliveryLocation;
    }

    const order = await Order.create(orderData);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order
    });
  } catch (error) {
    console.error("Place order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to place your order."
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Please log in again."
      });
    }

    const orders = await Order.find({ user: userId })
      .populate("deliveryPartner", "name phoneNo")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your orders."
    });
  }
};

export const cancelMyOrder = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (
      !userId ||
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user session or order ID."
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: id,
        user: userId,
        orderStatus: "Confirmed",
        $or: [
          { deliveryPartner: null },
          { deliveryPartner: { $exists: false } }
        ]
      },
      {
        $set: { orderStatus: "Cancelled" }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!order) {
      return res.status(409).json({
        success: false,
        message:
          "This order cannot be cancelled. It may already be preparing, assigned, or completed."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order
    });
  } catch (error) {
    console.error("Cancel customer order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel the order."
    });
  }
};
