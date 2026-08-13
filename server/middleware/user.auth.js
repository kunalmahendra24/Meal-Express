import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getTokenFromRequest } from '../utils/authToken.js';
dotenv.config({ quiet: true });

const authMiddleware = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id) {
      req.userId = decoded.id;
      req.user = decoded;
      next();
    } else {
      return res.status(401).json({ success: false, message: "Token is not valid" });
    }
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

export default authMiddleware;
