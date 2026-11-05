import { Admin } from "../models/Admin.schema.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const registerAdmin = async (req, res) => {

    const { name, email, password, } = req.body
    if (!name || !email || !password)
        return res.status(400).json({
            success: false, message: "all fields are required"
        })

    try {
        const isExist = await Admin.findOne({ email })
        if (isExist)
            return res.status(400).json({ message: "admin is already registerd", success: false })

        const hasPass = await bcrypt.hash(password, 10)
        const admin = await Admin.create({ name, email, password: hasPass })
        return res.status(201).json({ success: true, message: "admin registerd successfully", admin })

    } catch (error) {
        res.status(400).json({ message: error, sucess: false })
    }

}


export const loginAdmin = async (req, res) => {

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "all fields are required" })
    }

    const admin = await Admin.findOne({ email })
    if (!admin) {
        return res.status(400).json({ message: "user not registerd please check email", success: false })
    }
    const isMatch = await bcrypt.compare(password, admin.password)


    if (!isMatch) return res.status(400).json({ success: "false", message: "invalid credentials" })

    const token = jwt.sign({ userId: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

    res.cookie("adminToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60000,
    })

    return res.status(201).json({ success: true, message: "user login success", token })


}