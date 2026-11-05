
import jwt from "jsonwebtoken";
import { User } from "../models/User.schema.js";

const COOKIE_NAME = "token";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
};

const VALID_ROLES = ["customer", "restaurant", "deliveryPartner"];

const ROLE_ACCESS_MESSAGES = {
    customer: "Customer access only.",
    restaurant: "Restaurant access only.",
    deliveryPartner: "Delivery partner access only."
};

const clearAuthCookie = (res) => {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
};

const authenticateUser = async (req, res, next, requiredRole = null) => {
    try {
        const token = req.cookies?.[COOKIE_NAME];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please log in first."
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing.");

            return res.status(500).json({
                success: false,
                message: "Authentication service is not configured."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId) {
            clearAuthCookie(res);

            return res.status(401).json({
                success: false,
                message: "Invalid login session. Please log in again."
            });
        }

        const user = await User.findById(decoded.userId).select(
            "name email role accountDeletedAt"
        );

        if (!user || user.accountDeletedAt) {
            clearAuthCookie(res);

            return res.status(401).json({
                success: false,
                message: "This account is no longer active."
            });
        }

        const currentRole = user.role;

        if (!VALID_ROLES.includes(currentRole)) {
            clearAuthCookie(res);

            return res.status(403).json({
                success: false,
                message: "This account has no valid portal role."
            });
        }

        if (decoded.role && decoded.role !== currentRole) {
            clearAuthCookie(res);

            return res.status(401).json({
                success: false,
                message: "Your session role has changed. Please log in again."
            });
        }

        if (requiredRole && currentRole !== requiredRole) {
            return res.status(403).json({
                success: false,
                message:
                    ROLE_ACCESS_MESSAGES[requiredRole] ||
                    "You are not authorized to access this resource."
            });
        }

        req.user = {
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            role: currentRole
        };

        return next();
    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            clearAuthCookie(res);

            return res.status(401).json({
                success: false,
                message:
                    "Your login session is invalid or expired. Please log in again."
            });
        }

        console.error("User authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify your login session."
        });
    }
};

export const isUserAuth = (req, res, next) => {
    return authenticateUser(req, res, next);
};

export const isCustomerAuth = (req, res, next) => {
    return authenticateUser(req, res, next, "customer");
};

export const isRestaurantAuth = (req, res, next) => {
    return authenticateUser(req, res, next, "restaurant");
};

export const isDeliveryPartnerAuth = (req, res, next) => {
    return authenticateUser(req, res, next, "deliveryPartner");
};

export const isAdminAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.adminToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required."
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Authentication service is not configured."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.admin = decoded;

        return next();
    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            res.clearCookie("adminToken", COOKIE_OPTIONS);

            return res.status(401).json({
                success: false,
                message: "Admin login session is invalid or expired."
            });
        }

        console.error("Admin authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify admin authentication."
        });
    }
};
