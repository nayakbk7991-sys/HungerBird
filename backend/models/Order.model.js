
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish"
        },
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    deliveryAddress: {
      type: String,
      required: true
    },

    deliveryLocation: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    },

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    deliveryIssue: {
      reason: {
        type: String,
        default: ""
      },
      reportedAt: {
        type: Date,
        default: null
      },
      status: {
        type: String,
        enum: ["None", "Open", "Retrying", "Resolved"],
        default: "None"
      },
      resolutionNote: {
        type: String,
        default: ""
      }
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD"
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },

    orderStatus: {
      type: String,
      enum: [
        "Confirmed",
        "Preparing",
        "Ready for Pickup",
        "Out for Delivery",
        "Delivery Failed",
        "Delivered",
        "Cancelled"
      ],
      default: "Confirmed"
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
