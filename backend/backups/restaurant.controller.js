
import Order from "../models/Order.model.js";
import { User } from "../models/User.schema.js";

export const getRestaurantOrders = async (req, res) => {
    try {
        const restaurantUser = await User.findById(req.user.userId).select(
            "name role"
        );

        if (!restaurantUser || restaurantUser.role !== "restaurant") {
            return res.status(403).json({
                success: false,
                message: "Restaurant access only."
            });
        }

        const restaurantName = restaurantUser.name.trim().toLowerCase();

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("items.foodId", "name dishName restaurant");

        const restaurantOrders = [];

        for (const order of orders) {
            const orderData = order.toObject();

            const matchingItems = orderData.items.filter((item) => {
                const foodRestaurant =
                    item.restaurant || item.foodId?.restaurant;

                return (
                    typeof foodRestaurant === "string" &&
                    foodRestaurant.trim().toLowerCase() === restaurantName
                );
            });

            if (matchingItems.length > 0) {
                restaurantOrders.push({
                    ...orderData,
                    items: matchingItems,
                    totalAmount: matchingItems.reduce(
                        (total, item) =>
                            total + Number(item.price) * Number(item.quantity),
                        0
                    )
                });
            }
        }

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
