
import express from "express";
import {
  getMyOrders,
  cancelMyOrder,
  placeOrder
} from "../controllers/order.controller.js";
import { isUserAuth } from "../middlewares/auth.middleware.js";

const orderRouter = express.Router();

orderRouter.post("/place", isUserAuth, placeOrder);
orderRouter.get("/my-orders", isUserAuth, getMyOrders);
orderRouter.patch("/:id/cancel", isUserAuth, cancelMyOrder);

export default orderRouter;
