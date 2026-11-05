
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["customer", "restaurant", "deliveryPartner"],
        default: "customer"
    },
    savedAddress: {
        type: String,
        default: ""
    },
    restaurantLocation: {
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
    accountDeletedAt: {
        type: Date,
        default: null
    }
});

export const User = mongoose.model("User", userSchema);
