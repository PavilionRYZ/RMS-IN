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
        req.user = await User.findById(decoded.id);

        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Admins only(-_-)" });
        }

        next(); // Proceed to the next middleware or controller
    } catch (error) {
        // console.error(error);
        res.status(401).json({ message: "Invalid token, authorization denied" });
    }
};

exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];
       // console.log("token:", token);
        if (!token) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       // console.log("Decoded token:",decoded);
        req.user = await User.findById(decoded.id); // Assuming userId is in the decoded token
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next(); // Proceed to the next middleware or controller
    } catch (error) {
        // console.error(error);
        res.status(401).json({ message: "Invalid token, authorization denied" });
    }
};

// Middleware to check if the user is authorized to access the route
exports.checkAdminOrPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            // Ensure user exists
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Unauthorized: No user logged in" });
            }

            // Allow if user is an admin OR has the required permission
            if (req.user.role === "admin" || req.user.permissions.includes(requiredPermission)) {
                return next();
            }

            // If neither condition is met, deny access
            return res.status(403).json({ success: false, message: "Access Denied: You don't have permission to manage inventory" });

        } catch (error) {
            // console.error("Authorization error:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    };
};



