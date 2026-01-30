import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

// Admin authentication middleware
const adminMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "No token, authorization denied" 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id) {
            return res.status(401).json({ 
                success: false, 
                message: "Token is not valid" 
            });
        }

        // Get user and check role
        const user = await userModel.findById(decoded.id).select('role isActive');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        if (!user.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: "Account is deactivated" 
            });
        }

        if (user.role !== 'admin' && user.role !== 'super_admin') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Admin privileges required." 
            });
        }

        req.userId = decoded.id;
        req.userRole = user.role;
        next();

    } catch (error) {
        console.error("Admin auth error:", error.message);
        return res.status(401).json({ 
            success: false, 
            message: "Token is not valid" 
        });
    }
};

// Super admin middleware
const superAdminMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "No token, authorization denied" 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('role isActive');
        
        if (!user || user.role !== 'super_admin') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Super admin privileges required." 
            });
        }

        if (!user.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: "Account is deactivated" 
            });
        }

        req.userId = decoded.id;
        req.userRole = user.role;
        next();

    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: "Token is not valid" 
        });
    }
};

export { adminMiddleware, superAdminMiddleware };
export default adminMiddleware;
