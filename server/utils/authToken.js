import cookie from 'cookie';

export const getCookieOptions = () => {
    const frontendUrl = process.env.FRONTEND_URL || '';
    const crossSiteHttps = frontendUrl.startsWith('https://');
    const isProduction = process.env.NODE_ENV === 'production' || crossSiteHttps;

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    };
};

export const getTokenFromRequest = (req) => {
    if (req.cookies?.token) {
        return req.cookies.token;
    }

    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
        return header.slice(7).trim();
    }

    return null;
};

export const getTokenFromSocket = (socket) => {
    if (socket.handshake.auth?.token) {
        return socket.handshake.auth.token;
    }

    const header = socket.handshake.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
        return header.slice(7).trim();
    }

    const rawCookie = socket.handshake.headers.cookie;
    if (rawCookie) {
        const parsed = cookie.parse(rawCookie);
        if (parsed.token) {
            return parsed.token;
        }
    }

    return null;
};
