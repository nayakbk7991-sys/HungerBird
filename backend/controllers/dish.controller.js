import mongoose from "mongoose";
import { Dish } from "../models/Dishes.model.js";
import { User } from "../models/User.schema.js";

const parseBoolean = (value) =>
    value === true || value === "true";

const getRestaurantUser = async (userId) => {
    const user = await User.findById(userId).select("name role");

    if (!user || user.role !== "restaurant") {
        return null;
    }

    return user;
};

export const addDish = async (req, res) => {
    const {
        dishName,
        category,
        imgSrc,
        price,
        isVeg,
        isAvailable
    } = req.body;

    try {
        const dish = await Dish.create({
            dishName,
            name: dishName,
            category,
            imgSrc,
            image: imgSrc,
            price,
            isVeg,
            isAvailable
        });

        return res.status(201).json({
            success: true,
            message: "Dish added successfully.",
            dish
        });
    } catch (error) {
        console.error("Admin add dish error:", error);

        return res.status(400).json({
            success: false,
            message: "Unable to add dish."
        });
    }
};

export const getAllDishes = async (req, res) => {
    try {
        const dishes = await Dish.find({
            isAvailable: { $ne: false }
        }).sort({ _id: -1 });

        return res.status(200).json({
            success: true,
            message: "Available dishes fetched successfully.",
            dishes
        });
    } catch (error) {
        console.error("Get all dishes error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch dishes."
        });
    }
};

export const editDisheById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid dish ID."
            });
        }

        const updatedDish = await Dish.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedDish) {
            return res.status(404).json({
                success: false,
                message: "Dish not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Dish updated successfully.",
            dish: updatedDish
        });
    } catch (error) {
        console.error("Admin update dish error:", error);

        return res.status(400).json({
            success: false,
            message: "Unable to update dish."
        });
    }
};

export const deleteDishById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid dish ID."
            });
        }

        const deletedDish = await Dish.findByIdAndDelete(id);

        if (!deletedDish) {
            return res.status(404).json({
                success: false,
                message: "Dish not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Dish deleted successfully."
        });
    } catch (error) {
        console.error("Admin delete dish error:", error);

        return res.status(400).json({
            success: false,
            message: "Unable to delete dish."
        });
    }
};

export const addRestaurantDish = async (req, res) => {
    try {
        const {
            dishName,
            name,
            category,
            imgSrc,
            image,
            price,
            description,
            isVeg,
            isAvailable
        } = req.body;

        const restaurantUser = await getRestaurantUser(
            req.user?.userId
        );

        if (!restaurantUser) {
            return res.status(403).json({
                success: false,
                message: "Restaurant access only."
            });
        }

        const foodName = String(dishName || name || "").trim();
        const foodCategory = String(category || "").trim();
        const foodImage = String(imgSrc || image || "").trim();
        const numericPrice = Number(price);

        if (
            !foodName ||
            !foodCategory ||
            !foodImage ||
            price === undefined ||
            String(price).trim() === "" ||
            !Number.isFinite(numericPrice) ||
            numericPrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a food name, category, image, and valid price."
            });
        }

        const dish = await Dish.create({
            dishName: foodName,
            name: foodName,
            category: foodCategory,
            imgSrc: foodImage,
            image: foodImage,
            price: numericPrice,
            description: String(description || "").trim(),
            isVeg: parseBoolean(isVeg),
            isAvailable:
                isAvailable === undefined
                    ? true
                    : parseBoolean(isAvailable),
            restaurant: restaurantUser.name
        });

        return res.status(201).json({
            success: true,
            message: "Food item added successfully.",
            dish
        });
    } catch (error) {
        console.error("Restaurant add dish error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to add food item."
        });
    }
};

export const getRestaurantDishes = async (req, res) => {
    try {
        const restaurantUser = await getRestaurantUser(
            req.user?.userId
        );

        if (!restaurantUser) {
            return res.status(403).json({
                success: false,
                message: "Restaurant access only."
            });
        }

        const dishes = await Dish.find({
            restaurant: restaurantUser.name
        }).sort({ _id: -1 });

        return res.status(200).json({
            success: true,
            dishes
        });
    } catch (error) {
        console.error("Get restaurant dishes error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch restaurant menu."
        });
    }
};

export const updateRestaurantDishById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid dish ID."
            });
        }

        const restaurantUser = await getRestaurantUser(
            req.user?.userId
        );

        if (!restaurantUser) {
            return res.status(403).json({
                success: false,
                message: "Restaurant access only."
            });
        }

        const updates = {};
        const body = req.body;

        if ("dishName" in body || "name" in body) {
            const foodName = String(
                body.dishName ?? body.name ?? ""
            ).trim();

            if (!foodName) {
                return res.status(400).json({
                    success: false,
                    message: "Food name cannot be empty."
                });
            }

            updates.dishName = foodName;
            updates.name = foodName;
        }

        if ("category" in body) {
            const category = String(body.category || "").trim();

            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: "Category cannot be empty."
                });
            }

            updates.category = category;
        }

        if ("imgSrc" in body || "image" in body) {
            const imageUrl = String(
                body.imgSrc ?? body.image ?? ""
            ).trim();

            if (!imageUrl) {
                return res.status(400).json({
                    success: false,
                    message: "Image path cannot be empty."
                });
            }

            updates.imgSrc = imageUrl;
            updates.image = imageUrl;
        }

        if ("price" in body) {
            const price = Number(body.price);

            if (
                String(body.price).trim() === "" ||
                !Number.isFinite(price) ||
                price < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Enter a valid price."
                });
            }

            updates.price = price;
        }

        if ("description" in body) {
            updates.description = String(body.description || "").trim();
        }

        if ("isVeg" in body) {
            updates.isVeg = parseBoolean(body.isVeg);
        }

        if ("isAvailable" in body) {
            updates.isAvailable = parseBoolean(body.isAvailable);
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid changes were provided."
            });
        }

        const updatedDish = await Dish.findOneAndUpdate(
            {
                _id: id,
                restaurant: restaurantUser.name
            },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedDish) {
            return res.status(404).json({
                success: false,
                message: "Dish not found in your restaurant menu."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Restaurant menu item updated successfully.",
            dish: updatedDish
        });
    } catch (error) {
        console.error("Restaurant update dish error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update menu item."
        });
    }
};

export const deleteRestaurantDishById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid dish ID."
            });
        }

        const restaurantUser = await getRestaurantUser(
            req.user?.userId
        );

        if (!restaurantUser) {
            return res.status(403).json({
                success: false,
                message: "Restaurant access only."
            });
        }

        const deletedDish = await Dish.findOneAndDelete({
            _id: id,
            restaurant: restaurantUser.name
        });

        if (!deletedDish) {
            return res.status(404).json({
                success: false,
                message: "Dish not found in your restaurant menu."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Menu item deleted successfully."
        });
    } catch (error) {
        console.error("Restaurant delete dish error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete menu item."
        });
    }
};