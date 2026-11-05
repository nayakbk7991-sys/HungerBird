import express from "express";
import { isDeliveryPartnerAuth } from "../middlewares/auth.middleware.js";
import {
  getAvailableOrders,
  getAssignedOrders,
  claimDeliveryOrder,
  updateDeliveryStatus,
} from "../controllers/delivery.controller.js";

const deliveryRouter = express.Router();

deliveryRouter.get(
  "/available-orders",
  isDeliveryPartnerAuth,
  getAvailableOrders
);

deliveryRouter.get(
  "/orders",
  isDeliveryPartnerAuth,
  getAssignedOrders
);

deliveryRouter.post(
  "/orders/:id/claim",
  isDeliveryPartnerAuth,
  claimDeliveryOrder
);

deliveryRouter.patch(
  "/orders/:id/status",
  isDeliveryPartnerAuth,
  updateDeliveryStatus
);

export default deliveryRouter;