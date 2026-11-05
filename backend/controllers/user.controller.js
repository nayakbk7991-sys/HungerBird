
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.schema.js";

const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: NINETY_DAYS,
};

const ALLOWED_ROLES = ["customer", "restaurant", "deliveryPartner"];

const createToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT_SECRET is missing from backend environment variables."
        );
    }

    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "90d" }
    );
};

const profileResponse = (user) => ({
    name: user.name,
    email: user.email,
    phoneNo: user.phoneNo,
    role: user.role || "customer",
    savedAddress: user.savedAddress || "",
    restaurantLocation: {
        latitude: user.restaurantLocation?.latitude ?? null,
        longitude: user.restaurantLocation?.longitude ?? null,
    },
});

export const registerUser = async (req, res) => {
    try {
        const { name, email, phoneNo, password } = req.body;
        const requestedRole = req.body.role || "customer";

        if (
            !name?.trim() ||
            !email?.trim() ||
            !phoneNo?.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email, phone number, and password are required.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters.",
            });
        }

        if (!ALLOWED_ROLES.includes(requestedRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid account role.",
            });
        }

        let savedAddress = "";
        let restaurantLocation;

        if (requestedRole === "restaurant") {
            savedAddress =
                typeof req.body.savedAddress === "string"
                    ? req.body.savedAddress.trim()
                    : "";

            const location = req.body.restaurantLocation || {};
            const latitude = location.latitude;
            const longitude = location.longitude;

            if (!savedAddress) {
                return res.status(400).json({
                    success: false,
                    message: "Restaurant address is required.",
                });
            }

            if (
                latitude === undefined ||
                latitude === null ||
                latitude === "" ||
                longitude === undefined ||
                longitude === null ||
                longitude === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Select the restaurant's location on the map before registering.",
                });
            }

            const lat = Number(latitude);
            const lng = Number(longitude);

            if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lng) ||
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Enter valid restaurant map coordinates.",
                });
            }

            restaurantLocation = {
                latitude: lat,
                longitude: lng,
            };
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
            accountDeletedAt: null,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            name: name.trim(),
            email: normalizedEmail,
            phoneNo: phoneNo.trim(),
            password: hashedPassword,
            role: requestedRole,
        };

        if (requestedRole === "restaurant") {
            userData.savedAddress = savedAddress;
            userData.restaurantLocation = restaurantLocation;
        }

        const user = await User.create(userData);

        const token = createToken(user);

        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(201).json({
            success: true,
            message: "Account registered successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNo: user.phoneNo,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Register user error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to register account.",
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const requestedRole = req.body.role;

        if (!email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if (!user || user.accountDeletedAt) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        if (requestedRole && requestedRole !== user.role) {
            return res.status(403).json({
                success: false,
                message: `This is a ${user.role} account. Please use the correct login portal.`,
            });
        }

        const token = createToken(user);

        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNo: user.phoneNo,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login user error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to log in.",
        });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    } catch (error) {
        console.error("Logout user error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to log out.",
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ accountDeletedAt: null })
            .select("-password")
            .sort({ _id: -1 });

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("Get all users error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch users.",
        });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user?.userId).select(
            "name email phoneNo role savedAddress restaurantLocation accountDeletedAt"
        );

        if (!user || user.accountDeletedAt) {
            return res.status(404).json({
                success: false,
                message: "Profile not found.",
            });
        }

        return res.status(200).json({
            success: true,
            profile: profileResponse(user),
        });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch profile.",
        });
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user?.userId);

        if (!user || user.accountDeletedAt) {
            return res.status(404).json({
                success: false,
                message: "Profile not found.",
            });
        }

        const { name, phoneNo, savedAddress } = req.body;

        const nextName =
            typeof name === "string" ? name.trim() : user.name;

        const nextPhone =
            typeof phoneNo === "string" ? phoneNo.trim() : user.phoneNo;

        const nextAddress =
            typeof savedAddress === "string"
                ? savedAddress.trim()
                : user.savedAddress || "";

        if (!nextName || !nextPhone) {
            return res.status(400).json({
                success: false,
                message: "Name and phone number are required.",
            });
        }

        user.name = nextName;
        user.phoneNo = nextPhone;
        user.savedAddress = nextAddress;

        if (
            user.role === "restaurant" &&
            "restaurantLocation" in req.body
        ) {
            const location = req.body.restaurantLocation || {};
            const latitude = location.latitude;
            const longitude = location.longitude;

            const hasLatitude =
                latitude !== undefined &&
                latitude !== null &&
                latitude !== "";

            const hasLongitude =
                longitude !== undefined &&
                longitude !== null &&
                longitude !== "";

            if (hasLatitude !== hasLongitude) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Enter both latitude and longitude, or leave both empty.",
                });
            }

            if (hasLatitude && hasLongitude) {
                const lat = Number(latitude);
                const lng = Number(longitude);

                if (
                    !Number.isFinite(lat) ||
                    !Number.isFinite(lng) ||
                    lat < -90 ||
                    lat > 90 ||
                    lng < -180 ||
                    lng > 180
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Enter valid latitude and longitude values.",
                    });
                }

                user.restaurantLocation = {
                    latitude: lat,
                    longitude: lng,
                };
            } else {
                user.restaurantLocation = {
                    latitude: undefined,
                    longitude: undefined,
                };
            }
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            profile: profileResponse(user),
        });
    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update profile.",
        });
    }
};

export const deleteMyAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user?.userId);

        if (!user || user.accountDeletedAt) {
            return res.status(404).json({
                success: false,
                message: "Account not found.",
            });
        }

        user.accountDeletedAt = new Date();
        await user.save();

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully.",
        });
    } catch (error) {
        console.error("Delete account error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete account.",
        });
    }
};
