import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';
import { getTokenFromRequest } from '../utils/authToken.js';
dotenv.config({ quiet: true });

const authMiddleware = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: "Token is not valid" });
    }

    // A valid 7-day token must not outlive the account it belongs to
    const user = await userModel.findById(decoded.id).select('isActive').lean();
    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: "Account is unavailable" });
    }

    req.userId = decoded.id;
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

export default authMiddleware;
