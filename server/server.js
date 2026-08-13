import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/mongodb.js';
import Settings from './models/settingsModel.js';
import { initSocket } from './socket/index.js';

// Import routes
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/userRoutes.js';
import mealRouter from './routes/meal.routes.js';
import orderRouter from './routes/order.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import settingsRouter from './routes/settings.routes.js';
import adminRouter from './routes/admin.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'meals');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

// Connect to database
connectDB().then(async () => {
    try {
        await Settings.initializeDefaults();
        console.log('Default settings initialized');
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
});

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        if (process.env.NODE_ENV === 'production') {
            return callback(new Error('Not allowed by CORS'));
        }

        return callback(null, true);
    },
    credentials: true
}));

const io = initSocket(server, allowedOrigins);
app.set('io', io);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Meal Express API is running!',
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/meals', mealRouter);
app.use('/api/orders', orderRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value entered'
        });
    }

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'Not allowed by CORS'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

server.listen(port, () => {
    console.log(`🍽️  Meal Express server is running on port ${port}`);
});
