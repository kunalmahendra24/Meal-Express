import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authMiddleware = (req, res, next) => {
  console.log("---- AUTH DEBUG ----");
  console.log("Cookies received:", req.cookies);
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Missing");

  const  token  = req.cookies.token; 

  if (!token) {
    console.log("❌ No token found in cookies");
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified successfully:", decoded);

    if (decoded.id) {
      req.userId = decoded.id;
      req.user = decoded;
      next();
    } else {
      console.log("❌ Decoded token missing 'id'");
      return res.status(401).json({ success: false, message: "Token is not valid" });
    }

  } catch (error) {
    console.error("❌ JWT verification failed:", error.message);
    return res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

export default authMiddleware;
