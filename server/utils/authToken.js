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

// Auth rides only on the httpOnly cookie, so a token is never exposed to client-side JS
export const getTokenFromRequest = (req) => {
    return req.cookies?.token || null;
};

export const getTokenFromSocket = (socket) => {
    const rawCookie = socket.handshake.headers.cookie;
    if (rawCookie) {
        const parsed = cookie.parse(rawCookie);
        if (parsed.token) {
            return parsed.token;
        }
    }

    return null;
};
