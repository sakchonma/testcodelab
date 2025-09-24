"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Profile_1 = __importDefault(require("../models/Profile"));
const authorize = (...roles) => async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = await Profile_1.default.findById(decoded.id).select("username email role");
            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }
            if (roles.length > 0 && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Forbidden: insufficient role" });
            }
            return next();
        }
        catch (error) {
            return res.status(401).json({ message: "Not authorized" });
        }
    }
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
};
exports.default = authorize;
