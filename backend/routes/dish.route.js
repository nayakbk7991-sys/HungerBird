import express from "express";

import {
    addDish,
    deleteDishById,
    editDisheById,
    getAllDishes,
    addRestaurantDish,
    getRestaurantDishes,
    updateRestaurantDishById,
    deleteRestaurantDishById
} from "../controllers/dish.controller.js";

import {
    isAdminAuth,
    isRestaurantAuth
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", isAdminAuth, addDish);

router.get("/all", getAllDishes);

router.put("/update/:id", isAdminAuth, editDisheById);

router.delete("/delete/:id", isAdminAuth, deleteDishById);

router.post(
    "/restaurant-add",
    isRestaurantAuth,
    addRestaurantDish
);

router.get(
    "/restaurant/all",
    isRestaurantAuth,
    getRestaurantDishes
);

router.patch(
    "/restaurant/update/:id",
    isRestaurantAuth,
    updateRestaurantDishById
);

router.delete(
    "/restaurant/delete/:id",
    isRestaurantAuth,
    deleteRestaurantDishById
);

export default router;