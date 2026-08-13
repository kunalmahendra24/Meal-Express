const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

export const resolveImageUrl = (src, apiUrl = '') => {
    if (!src) return PLACEHOLDER;
    if (/^(https?:|data:|blob:)/i.test(src)) return src;
    return `${apiUrl}${src}`;
};

export default resolveImageUrl;
