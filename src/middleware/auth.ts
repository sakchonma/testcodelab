import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import profileModel from "../models/Profile";

interface AuthRequest extends Request {
    user?: any;
}

const authorize = (...roles: string[]) => async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        try {

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);


            req.user = await profileModel.findById(decoded.id).select("username email role");

            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }

            if (roles.length > 0 && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Forbidden: insufficient role" });
            }

            return next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
};

export default authorize;
