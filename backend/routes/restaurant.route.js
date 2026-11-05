
import express from "express";
import { isRestaurantAuth } from "../middlewares/auth.middleware.js";
import {
    getRestaurantOrders,
    updateRestaurantOrderStatus
} from "../controllers/restaurant.controller.js";

const restaurantRouter = express.Router();

restaurantRouter.get(
    "/orders",
    isRestaurantAuth,
    getRestaurantOrders
);

restaurantRouter.patch(
    "/orders/:id/status",
    isRestaurantAuth,
    updateRestaurantOrderStatus
);

export default restaurantRouter;
