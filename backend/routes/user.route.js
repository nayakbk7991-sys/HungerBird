
import express from "express";

import {
    getAllUsers,
    loginUser,
    logoutUser,
    registerUser,
    getMyProfile,
    updateMyProfile,
    deleteMyAccount
} from "../controllers/user.controller.js";

import { isAdminAuth, isUserAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/check-auth", isUserAuth, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "User authenticated.",
        role: req.user.role,
        user: {
            userId: req.user.userId,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

router.get("/profile", isUserAuth, getMyProfile);

router.patch("/profile", isUserAuth, updateMyProfile);

router.delete("/account", isUserAuth, deleteMyAccount);

router.get("/all", isAdminAuth, getAllUsers);

export default router;
