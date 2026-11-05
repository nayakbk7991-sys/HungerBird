import jwt from "jsonwebtoken"

export const isUserAuth = async (req, res, next) => {

    const token = req.cookies.userToken

    if (!token) return res.status(400).json({ success: false, message: "user not authenticated" })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
}

export const isAdminAuth = async (req, res, next) => {
    const token = req.cookies.adminToken

    if (!token) return res.status(400).json({ success: false, message: "not authenticated" })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = decoded
    next()
}