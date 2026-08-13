import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";
import { getCookieOptions } from "../utils/authToken.js";
dotenv.config({ quiet: true });

const sanitizeUser = (user) => {
    const safe = user.toObject ? user.toObject() : { ...user };
    delete safe.password;
    delete safe.verifyOtp;
    delete safe.verifyOtpExpireAt;
    delete safe.resetOtp;
    delete safe.resetOtpExpireAt;
    return safe;
};

const sendEmailSafe = async (mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error.message);
        return false;
    }
};

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    try {
        const existingUser = await userModel.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const isFirstUser = (await userModel.countDocuments()) === 0;
        const user = new userModel({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: isFirstUser ? 'super_admin' : 'user'
        });
        await user.save();

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ success: false, message: "Server configuration error" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, getCookieOptions());

        sendEmailSafe({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Welcome to Meal Express',
            text: `Hello ${user.name},\n\nWelcome to Meal Express! We're excited to have you on board.\n\nBest regards,\nThe Meal Express Team`
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: sanitizeUser(user),
            token
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Account is deactivated" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ success: false, message: "Server configuration error" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, getCookieOptions());

        user.lastLogin = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: sanitizeUser(user),
            token
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const options = getCookieOptions();
        delete options.maxAge;
        res.clearCookie('token', options);
        res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const isAuthenticated = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication check failed. Please ensure authMiddleware runs first."
        });
    }

    try {
        const user = await userModel.findById(req.userId).select('-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt');

        if (!user) {
            return res.status(404).json({ success: false, message: "Authenticated user not found in database." });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Account is deactivated" });
        }

        res.status(200).json({
            success: true,
            message: "User is authenticated and active.",
            user
        });
    } catch (error) {
        console.error("Error fetching authenticated user:", error.message);
        res.status(500).json({ success: false, message: "Server error while fetching user details.", error: error.message });
    }
};

export const sendVerifyOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }
        if (user.isAccountVerified) {
            return res.status(400).json({ success: false, message: "Account already verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
        await user.save();

        const sent = await sendEmailSafe({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Your Verification OTP',
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        });

        if (!sent) {
            return res.status(500).json({ success: false, message: "Error sending email. Check SMTP settings." });
        }

        return res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const verifyAccount = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }
        if (user.isAccountVerified) {
            return res.status(400).json({ success: false, message: "Account already verified" });
        }
        if (user.verifyOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();
        res.status(200).json({ success: true, message: "Account verified successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
        await user.save();

        const sent = await sendEmailSafe({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Your Password Reset OTP',
            text: `Hello ${user.name},\n\nYour OTP for password reset is ${otp}. It is valid for 10 minutes.\n\nBest regards,\nThe Meal Express Team`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        });

        if (!sent) {
            return res.status(500).json({ success: false, message: "Error sending email. Check SMTP settings." });
        }

        return res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }
        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();
        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
