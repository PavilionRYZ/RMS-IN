import jwt from "jsonwebtoken";
import { ErrorHandler } from "./errorHandler";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return next(ErrorHandler(401, "Unauthorized access"));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(ErrorHandler(401, "Forbidden access"));
        }
        req.user = user;
        next();
    })
}