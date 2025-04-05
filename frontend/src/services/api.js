import axios from 'axios';
import * as mmb from 'music-metadata-browser';

const API_URL = import.meta.env.VITE_API_URL || 'https://revify.onrender.com' || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000,
    withCredentials: true
});

const retryDelay = (retryNumber = 0) => Math.min(1000 * (2 ** retryNumber), 10000);

api.interceptors.response.use(
    response => response,
    async error => {
        const { config, message } = error;
        
        if (!config || !config.retry) {
            console.error('API Error:', message);
            throw error;
        }

        config.retryCount = config.retryCount ?? 0;

        if (config.retryCount >= 3) {
            console.error('Max retries reached:', message);
            throw error;
        }

        config.retryCount += 1;
        await new Promise(resolve => setTimeout(resolve, retryDelay(config.retryCount)));
        
        return api(config);
    }
);

// Add retry configuration to requests
const withRetry = config => ({ ...config, retry: true });

export const checkAPIStatus = async () => {
    try {
        const response = await api.get('/', withRetry());
        return response.data;
    } catch (error) {
        console.error('API Status Check Error:', error.message);
        throw new Error('Unable to connect to server');
    }
};

const compressImage = async (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
};

export const uploadImage = async (file) => {
    try {
        if (!file) throw new Error('No file selected');
        const compressedImage = await compressImage(file);
        const response = await api.post('/api/upload', {
            data: compressedImage
        });
        if (!response.data || !response.data.url) {
            throw new Error('Invalid response from server');
        }
        return response.data.url;
    } catch (error) {
        console.error('Upload Error:', error);
        throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
};

const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

export const uploadAudio = async (file, onProgress) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: e => {
                const progress = Math.round((e.loaded * 100) / e.total);
                onProgress?.(progress);
            },
            // Increase timeout for large files
            timeout: 30000
        });

        if (!response.data?.url) {
            throw new Error('Invalid response from server');
        }

        return response.data.url;
    } catch (error) {
        console.error('Upload error:', error);
        throw new Error(error?.response?.data?.message || 'Failed to upload audio');
    }
};

export const fetchSongs = async () => {
    try {
        const response = await api.get('/api/songs');
        return response.data;
    } catch (error) {
        console.error('Error fetching songs:', error);
        throw error;
    }
};

export const fetchSongById = async (id) => {
    try {
        const response = await api.get(`/api/songs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching song:', error);
        throw error;
    }
};

export default api;