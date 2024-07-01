require("dotenv").config();
const JWT = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
    const token = req.cookies?.token || null;
    console.log("PRINTING TOKEN:", token);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not Authorized: No token provided"
        });
    }

    try {
        // Verify JWT token
        const payload = JWT.verify(token, process.env.SECRET);
        console.log("Token verified, user payload:", payload);

        // Attach user info to the request object
        req.user = { id: payload.id, email: payload.email };
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Not Authorized: " + error.message
        });
    }
};

module.exports = jwtAuth;
