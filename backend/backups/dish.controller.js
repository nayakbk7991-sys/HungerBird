import { Dish } from "../models/Dishes.model.js"

export const addDish = async (req, res) => {
    const { dishName, category, imgSrc, price, isVeg, isAvailable } = req.body

    try {
        const dish = await Dish.create({ dishName, imgSrc, category, price, isVeg, isAvailable })
        res.status(200).json({ success: true, message: "dish added successfylly ", dish })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error, success: false })
    }
}

export const getAllDishes = async (req, res) => {
    try {
        const dishes = await Dish.find()
        if (!dishes) return res.status(404).json({ success: false, message: "dishes not found" })
        return res.status(200).json({ message: "all dishes fetch successfully ", success: true, dishes })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error, success: false })
    }
}

export const editDisheById = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedDish = await Dish.findByIdAndUpdate(id, req.body, { new: true })

        if (!updatedDish) return res.status(400).json({ success: false, message: "dish not found" })

        return res.status(200).json({ message: "dish updated successfully ", success: true, dish: updatedDish })


    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error, success: false })
    }
}

export const deleteDishById = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedDish = await Dish.findByIdAndDelete(id)

        if (!updatedDish) return res.status(400).json({ success: false, message: "dish not found" })

        return res.status(200).json({ message: "dish deleted successfully ", success: true })


    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error, success: false })
    }
}


