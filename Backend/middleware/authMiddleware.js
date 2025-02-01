const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.verifyAdmin = async (req, res, next) => {
    try {
        // Extract token from cookies or Authorization header
        const token =
            req.cookies.token || req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId);

        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }

        next(); // Proceed to the next middleware or controller
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Invalid token, authorization denied" });
    }
};

exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId); // Assuming userId is in the decoded token
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next(); // Proceed to the next middleware or controller
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Invalid token, authorization denied" });
    }
};
