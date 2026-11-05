
import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import { User } from "../models/User.schema.js";

function belongsToRestaurant(order, restaurantName) {
    const items = order.items || [];

    return (
        items.length > 0 &&
        items.every((item) => {
            const dishRestaurant = item.foodId?.restaurant;

            return (
                typeof dishRestaurant === "string" &&
                dishRestaurant.trim().toLowerCase() ===
                    restaurantName.trim().toLowerCase()
            );
        })
    );
}

function formatOrder(order) {
    const data = order.toObject();

    data.items = (data.items || []).map((item) => ({
        ...item,
        name:
            item.name ||
            item.foodId?.dishName ||
            item.foodId?.name ||
            "Food item"
    }));

    return data;
}

export const getRestaurantOrders = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(401).json({
                success: false,
                message: "Please log in again."
            });
        }

        const restaurantUser = await User.findById(userId).select("name role");

        if (!restaurantUser || restaurantUser.role !== "restaurant") {
            return res.status(403).json({
                success: false,
                message: "Restaurant access only."
            });
        }

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("user", "name phoneNo")
            .populate("items.foodId", "name dishName restaurant image imgSrc");

        const restaurantOrders = orders
            .filter((order) =>
                belongsToRestaurant(order, restaurantUser.name || "")
            )
            .map(formatOrder);

        return res.status(200).json({
            success: true,
            orders: restaurantOrders
        });
    } catch (error) {
        console.error("Fetch restaurant orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch restaurant orders."
        });
    }
};

export const updateRestaurantOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;
        const userId = req.user?.userId;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(401).json({
                success: false,
                message: "Please log in again."
            });
        }

        const restaurantUser = await User.findById(userId).select("name role");

        if (!restaurantUser || restaurantUser.role !== "restaurant") {
            return res.status(403).json({
                success: false,
                message: "Restaurant access only."
            });
        }

        if (!["Preparing", "Ready for Pickup"].includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant order status."
            });
        }

        const order = await Order.findById(id).populate(
            "items.foodId",
            "name dishName restaurant"
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (!belongsToRestaurant(order, restaurantUser.name || "")) {
            return res.status(403).json({
                success: false,
                message:
                    "This order does not belong entirely to your restaurant. Check the restaurant name saved on the dishes."
            });
        }

        if (
            orderStatus === "Preparing" &&
            order.orderStatus !== "Confirmed"
        ) {
            return res.status(400).json({
                success: false,
                message: "Only confirmed orders can be marked as preparing."
            });
        }

        if (
            orderStatus === "Ready for Pickup" &&
            order.orderStatus !== "Preparing"
        ) {
            return res.status(400).json({
                success: false,
                message: "Prepare the order before marking it ready for pickup."
            });
        }

        order.orderStatus = orderStatus;
        await order.save();

        return res.status(200).json({
            success: true,
            message:
                orderStatus === "Ready for Pickup"
                    ? "Order is ready for pickup and can appear in the delivery partner dashboard."
                    : "Order status updated successfully.",
            order
        });
    } catch (error) {
        console.error("Update restaurant order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update restaurant order status."
        });
    }
};
