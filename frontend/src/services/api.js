import axios from 'axios';
import * as mmb from 'music-metadata-browser';

const API_URL = 'https://revify.onrender.com';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000, // Increased timeout for deployed server
    withCredentials: false
});

// Add request interceptor
api.interceptors.response.use(
    response => response,
    async error => {
        const { config } = error;
        
        if (!config || !config.retry) {
            return Promise.reject(error);
        }

        config.retryCount = config.retryCount ?? 0;

        if (config.retryCount >= MAX_RETRIES) {
            // Dispatch a custom event that App.jsx can listen to
            window.dispatchEvent(new CustomEvent('api-error', { 
                detail: { message: 'Connection failed after multiple retries' }
            }));
            return Promise.reject(error);
        }

        config.retryCount += 1;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        
        return api(config);
    }
);

// Add retry configuration to requests
const withRetry = config => ({ ...config, retry: true });

// Add request interceptor for retries
api.interceptors.request.use(
    config => {
        console.log(`Making ${config.method.toUpperCase()} request to ${API_URL}${config.url}`);
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

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
        console.log('Fetching songs from deployed server:', `${API_URL}/api/songs`);
        const response = await api.get('/api/songs', { retry: true });
        
        if (!response.data) {
            throw new Error('No data received from server');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error fetching songs from deployed server:', error);
        throw new Error(`Failed to fetch songs: ${error.message}`);
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