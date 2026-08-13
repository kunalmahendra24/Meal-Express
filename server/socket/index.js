import { Server } from 'socket.io';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const initSocket = (httpServer, allowedOrigins) => {
    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            const rawCookie = socket.handshake.headers.cookie;
            if (!rawCookie) {
                return next(new Error('unauthorized'));
            }

            const parsed = cookie.parse(rawCookie);
            const token = parsed.token;
            if (!token) {
                return next(new Error('unauthorized'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded?.id) {
                return next(new Error('unauthorized'));
            }

            const user = await userModel.findById(decoded.id).select('role isActive');
            if (!user || !user.isActive) {
                return next(new Error('unauthorized'));
            }

            socket.userId = decoded.id.toString();
            socket.role = user.role;
            next();
        } catch {
            next(new Error('unauthorized'));
        }
    });

    io.on('connection', (socket) => {
        socket.join(`user:${socket.userId}`);

        if (socket.role === 'admin' || socket.role === 'super_admin') {
            socket.join('admins');
        }

        if (process.env.NODE_ENV !== 'production') {
            console.debug(`[socket] connected user=${socket.userId} role=${socket.role}`);
        }

        socket.on('disconnect', () => {
            if (process.env.NODE_ENV !== 'production') {
                console.debug(`[socket] disconnected user=${socket.userId}`);
            }
        });
    });

    return io;
};

export default initSocket;
