import express from 'express';
import { logout,login, register } from '../controller/auth.controller.js';
import authMiddleware from '../middleware/user.auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../validators/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.validators.js';
import { sendResetOtp,sendVerifyOtp,resetPassword,verifyAccount } from '../controller/auth.controller.js';
import { isAuthenticated } from '../controller/auth.controller.js';
const authRouter = express.Router();
// Credential and OTP endpoints are rate limited; read-only routes stay open
authRouter.post('/register', authLimiter, validate(registerSchema), register);
authRouter.post('/login', authLimiter, validate(loginSchema), login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',authLimiter,sendVerifyOtp);
authRouter.post('/verify-account',authLimiter,authMiddleware,verifyAccount);
authRouter.get('/is-auth',authMiddleware,isAuthenticated);
authRouter.post('/send-reset-otp',authLimiter,sendResetOtp);
authRouter.post('/reset-password',authLimiter,resetPassword);
export default authRouter;
 

