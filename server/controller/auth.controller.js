import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import transporter from "../nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";
dotenv.config();

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if(!name || !email || !password) {
        return res.status(400).json({ success:false, message: "All fields are required" });
    }
    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email.toLowerCase().trim();
    // let see user exist or not
    try {
        const existingUser = await userModel.findOne({ email: normalizedEmail });    
        if(existingUser) {
            return res.status(400).json({success:false, message: "User already exists" });
        }  
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // create new user
        const user = new userModel({ name, email: normalizedEmail, password:hashedPassword });
        await user.save();
        
        
    // generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    if(!token) {
        return res.status(500).json({ success:false,  message: "Could not generate token" });
    } 
    // set the token in cookie
   const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'None', 
    maxAge: 7*24*60*60*1000 
    });

    // Sending Welcome Email
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email, 
        subject: 'Welcome to Our Platform',
        text: `Hello ${user.name},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Team`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        }
        else {
            console.log('Email sent:', info.response);
        }
        res.status(201).json({  success:true, message: "User registered successfully", user });
    });

    } catch (error) {
        res.status(500).json({ success:false, message: "Server error", error: error.message });
    }

}
export const login = async (req, res) => {
    const { email, password } = req.body;   
    if(!email || !password) {
        return res.status(400).json({ success:false, message: "All fields are required" });
    }   
    try {
        // Normalize email to lowercase and trim whitespace to match stored format
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });
        if(!user) {
            return res.status(400).json({ success:false, message: "User does not exist" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(400).json({ success:false, message: "Invalid credentials" });
        }   
        // generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        if(!token) {
            return res.status(500).json({ success:false,message: "Could not generate token" });
        }
        // set the token in cookie
       const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'None', 
        maxAge: 7*24*60*60*1000 
    });
        res.status(200).json({ success:true, message: "Login successful", user, token });
    } catch (error) {
        res.status(500).json({ success:false,message: "Server error", error: error.message });
    }   
}
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'None' });
        res.status(200).json({ success:true, message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ success:false, message: "Server error", error: error.message });
    }       
}   

export const isAuthenticated = async (req, res) => {
    // Check if the authMiddleware successfully attached the userId
    if (!req.userId) {
        // If the middleware passed, this shouldn't happen, but acts as a fail-safe
        return res.status(401).json({ 
            success: false, 
            message: "Authentication check failed. Please ensure authMiddleware runs first." 
        });
    }

    try {
        // Fetch the user details using the ID attached by the middleware
        // .select() excludes sensitive fields from the response
        const user = await userModel.findById(req.userId).select('-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt');

        if (!user) {
            return res.status(404).json({ success: false, message: "Authenticated user not found in database." });
        }

        // Respond with success and user data
        res.status(200).json({
            success: true,
            message: "User is authenticated and active.",
            user: user
        });

    } catch (error) {
        console.error("Error fetching authenticated user:", error.message);
        res.status(500).json({ success: false, message: "Server error while fetching user details.", error: error.message });
    }
};
export const sendVerifyOtp = async (req, res) => {
    const { email } = req.body; 
    if(!email) {
        return res.status(400).json({ success:false, message: "Email is required" });
    }
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });
        if(!user) {
            return res.status(400).json({ success:false, message: "User does not exist" });
        }
        if(user.isAccountVerified) {
            return res.status(400).json({ success:true, message: "Account already verified" });
        }
        // generate otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpireAt = Date.now() + 10*60*1000;
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = otpExpireAt;
        await user.save();
        // send otp to email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Your Verification OTP',
            // text: `Hello ${user.name},\n\nYour OTP for email verification is ${otp}. It is valid for 10 minutes.\n\nBest regards,\nThe Team`,
            html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        };  
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ success:false, message: "Error sending email", error });
            }
            else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ success:true, message: "OTP sent to email" });
            }   
        });
    } catch (error) {
        res.status(500).json({ success:false, message: "Server error", error: error.message });
    }   
}
export const verifyAccount = async (req, res) => {
    const { email, otp } = req.body;
    if(!email || !otp) {
        return res.status(400).json({ success:false, message: "All fields are required" });
    }
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });
        if(!user) {
            return res.status(400).json({ success:false, message: "User does not exist" });
        }
        if(user.isAccountVerified) {
            return res.status(400).json({ message: "Account already verified" });
        }
        if(user.verifyOtp !== otp) {
            return res.status(400).json({ success:false, message: "Invalid OTP" });
        }
        if(user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success:false, message: "OTP has expired" });
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();
        res.status(200).json({ success:true, message: "Account verified successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if(!email) {
        return res.status(400).json({ success:false,message: "Email is required" });
    }
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });
        if(!user) {
            return res.status(400).json({ success:false, message: "User does not exist" });
        }
        if(!user.isAccountVerified) {
            return res.status(400).json({success:false, message: "Account is not verified" });
        }
        // generate otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpireAt = Date.now() + 10*60*1000;
        user.resetOtp = otp;
        user.verifyOtpExpireAt = otpExpireAt;

        await user.save(); 
        // send otp to email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Your Password Reset OTP',
            text: `Hello ${user.name},\n\nYour OTP for password reset is ${otp}. It is valid for 10 minutes.\n\nBest regards,\nThe Team`,
           html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        };
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ success:false, message: "Error sending email", error });
            }
            else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ success:true, message: "OTP sent to email" });
            }
        });
    } catch (error) {
        res.status(500).json({ success:false, message: "Server error", error: error.message });
    }

}
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if(!email || !otp || !newPassword) {
        return res.status(400).json({ success:false, message: "All fields are required" });
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });
        if(!user) {
            return res.status(400).json({ success:false, message: "User does not exist" });
        }
        if(user.resetOtp !== otp) {
            return res.status(400).json({ success:false, message: "Invalid OTP" });
        }
        if(user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success:false, message: "OTP has expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();
        res.status(200).json({ success:true,message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({success:false, message: "Server error", error: error.message });
    }
}

