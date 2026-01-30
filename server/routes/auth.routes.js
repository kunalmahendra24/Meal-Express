import express, { Router } from 'express';
import { logout,login, register } from '../controller/auth.controller.js';
import authMiddleware from '../middleware/user.auth.js';
import { sendResetOtp,sendVerifyOtp,resetPassword,verifyAccount } from '../controller/auth.controller.js';
import { isAuthenticated } from '../controller/auth.controller.js';
const authRouter = express.Router();
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',sendVerifyOtp);
authRouter.post('/verify-account',authMiddleware,verifyAccount);
authRouter.get('/is-auth',authMiddleware,isAuthenticated);
authRouter.post('/send-reset-otp',sendResetOtp);
authRouter.post('/reset-password',resetPassword);
export default authRouter;
 

