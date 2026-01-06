export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://findatutor2.vercel.app';

export const getApiUrl = (path: string) => {
    // If path starts with /, remove it to avoid double slashes if base url ends with / (though we'll assume base url doesn't)
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};
