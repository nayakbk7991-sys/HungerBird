
import mongoose from "mongoose";
import Order from "../models/Order.model.js";

const AVAILABLE_STATUSES = [
    "Confirmed",
    "Preparing",
    "Ready for Pickup"
];

const DELIVERY_STATUSES = [
    "Ready for Pickup",
    "Out for Delivery",
    "Delivery Failed",
    "Delivered"
];

const isValidId = (id) => mongoose.isValidObjectId(id);

const getUserId = (req) => req.user?.userId;

const getUnassignedOrderFilter = () => ({
    $or: [
        { deliveryPartner: null },
        { deliveryPartner: { $exists: false } }
    ]
});

const populateOrder = (query) =>
    query
        .populate("user", "name email phoneNo")
        .populate("items.foodId", "name dishName restaurant");

const sendError = (res, status, message) =>
    res.status(status).json({
        success: false,
        message
    });

export const getAvailableOrders = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId || !isValidId(userId)) {
            return sendError(
                res,
                401,
                "Invalid delivery partner session."
            );
        }

        const orders = await populateOrder(
            Order.find({
                orderStatus: { $in: AVAILABLE_STATUSES },
                ...getUnassignedOrderFilter()
            }).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Fetch available deliveries error:", error);

        return sendError(
            res,
            500,
            "Unable to fetch available deliveries."
        );
    }
};

export const getAssignedOrders = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId || !isValidId(userId)) {
            return sendError(
                res,
                401,
                "Invalid delivery partner session."
            );
        }

        const orders = await populateOrder(
            Order.find({
                deliveryPartner: userId
            }).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Fetch assigned deliveries error:", error);

        return sendError(
            res,
            500,
            "Unable to fetch assigned deliveries."
        );
    }
};

export const claimDeliveryOrder = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        if (!userId || !isValidId(userId) || !isValidId(id)) {
            return sendError(
                res,
                400,
                "Invalid delivery partner or order ID."
            );
        }

        const order = await Order.findOneAndUpdate(
            {
                _id: id,
                orderStatus: { $in: AVAILABLE_STATUSES },
                ...getUnassignedOrderFilter()
            },
            {
                $set: {
                    deliveryPartner: userId
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!order) {
            return sendError(
                res,
                409,
                "This order is no longer available. Refresh the order list."
            );
        }

        return res.status(200).json({
            success: true,
            message: "Order accepted successfully.",
            order
        });
    } catch (error) {
        console.error("Accept delivery order error:", error);

        return sendError(
            res,
            500,
            "Unable to accept this order."
        );
    }
};

export const updateDeliveryStatus = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;
        const { orderStatus, failureReason } = req.body;

        if (!userId || !isValidId(userId) || !isValidId(id)) {
            return sendError(
                res,
                400,
                "Invalid delivery partner or order ID."
            );
        }

        if (!DELIVERY_STATUSES.includes(orderStatus)) {
            return sendError(
                res,
                400,
                "Invalid delivery status."
            );
        }

        const order = await Order.findOne({
            _id: id,
            deliveryPartner: userId
        });

        if (!order) {
            return sendError(
                res,
                404,
                "Assigned order not found."
            );
        }

        if (
            orderStatus === "Out for Delivery" &&
            order.orderStatus !== "Ready for Pickup"
        ) {
            return sendError(
                res,
                400,
                "The order must be Ready for Pickup first."
            );
        }

        if (
            orderStatus === "Delivered" &&
            order.orderStatus !== "Out for Delivery"
        ) {
            return sendError(
                res,
                400,
                "The order must be Out for Delivery first."
            );
        }

        if (
            orderStatus === "Delivery Failed" &&
            !["Ready for Pickup", "Out for Delivery"].includes(
                order.orderStatus
            )
        ) {
            return sendError(
                res,
                400,
                "The order cannot be marked as failed at its current stage."
            );
        }

        if (orderStatus === "Delivery Failed") {
            order.deliveryIssue = {
                status: "Open",
                reason:
                    typeof failureReason === "string" &&
                    failureReason.trim()
                        ? failureReason.trim()
                        : "Delivery attempt failed."
            };
        }

        if (
            orderStatus === "Out for Delivery" &&
            order.deliveryIssue?.status === "Open"
        ) {
            order.deliveryIssue.status = "Retrying";
        }

        if (
            orderStatus === "Delivered" &&
            order.deliveryIssue?.status !== "None"
        ) {
            order.deliveryIssue.status = "Resolved";
        }

        order.orderStatus = orderStatus;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Delivery status updated successfully.",
            order
        });
    } catch (error) {
        console.error("Update delivery status error:", error);

        return sendError(
            res,
            500,
            "Unable to update delivery status."
        );
    }
};
