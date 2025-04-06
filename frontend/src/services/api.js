import axios from 'axios';
import * as mmb from 'music-metadata-browser';

const LOCAL_URL = 'http://localhost:5000';
const PROD_URL = 'https://revify.onrender.com';

const API_BASE_URL = process.env.NODE_ENV === 'development' ? LOCAL_URL : PROD_URL;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const api = axios.create({
    baseURL: API_BASE_URL,
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
        console.log(`Making ${config.method.toUpperCase()} request to ${API_BASE_URL}${config.url}`);
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

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const getCached = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  return cached.data;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Update fetchSongs with caching
export const fetchSongs = async () => {
  const cachedSongs = getCached('songs');
  if (cachedSongs) return cachedSongs;

  try {
    const response = await api.get('/api/songs', { retry: true });
    if (!response.data) throw new Error('No data received');
    setCache('songs', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching songs:', error);
    throw error;
  }
};

// Update fetchSongById with caching
export const fetchSongById = async (id) => {
    try {
        console.log('Fetching song:', id);
        const response = await api.get(`/api/songs/${id}`);
        if (!response.data) {
            throw new Error('No song data received');
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching song:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Failed to fetch song details');
    }
};

export const createUser = async (userData) => {
    try {
        const response = await api.post('/api/auth/register', userData);
        if (!response.data) throw new Error('No response data');
        return response.data;
    } catch (error) {
        console.error('Create user error:', error.response?.data || error);
        if (error.response?.status === 409) {
            throw new Error('Username already exists');
        }
        throw new Error('Registration failed');
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/api/auth/login', credentials);
        if (!response.data) throw new Error('No response data');
        return response.data;
    } catch (error) {
        console.error('Login error:', error.response?.data || error);
        if (error.response?.status === 401) {
            throw new Error('Invalid username or password');
        }
        throw new Error('Login failed');
    }
};

export const getUser = async (username) => {
    try {
        const response = await api.get(`/api/users/${username}`);
        if (!response.data) {
            throw new Error('No user data received');
        }
        return response.data;
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
};

export const createPlaylist = async (username, playlistName) => {
    try {
        const response = await api.post(`/api/users/${username}/playlists`, { name: playlistName });
        return response.data;
    } catch (error) {
        throw new Error('Failed to create playlist');
    }
};

export const updatePlaylistName = async (username, playlistId, name) => {
    try {
        const response = await api.put(`/api/users/${username}/playlists/${playlistId}`, { name });
        if (!response.data) {
            throw new Error('No response data');
        }
        return response.data;
    } catch (error) {
        console.error('Update playlist error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update playlist name');
    }
};

export const deletePlaylist = async (username, playlistId) => {
    try {
        const response = await api.delete(`/api/users/${username}/playlists/${playlistId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete playlist');
    }
};

export const addSongToPlaylist = async (username, playlistId, songId) => {
    try {
        const response = await api.post(`/api/users/${username}/playlists/${playlistId}/songs`, { songId });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to add song to playlist');
    }
};

export const removeSongFromPlaylist = async (username, playlistId, songId) => {
    try {
        const response = await api.delete(`/api/users/${username}/playlists/${playlistId}/songs/${songId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to remove song from playlist');
    }
};

export const getPlaylists = async (username) => {
    try {
        const response = await api.get(`/api/users/${username}/playlists`);
        return response.data;
    } catch (error) {
        console.error('Get playlists error:', error);
        throw new Error('Failed to fetch playlists');
    }
};

export const toggleLikeSong = async (username, songId, isLiking = true) => {
    try {
        const method = isLiking ? 'post' : 'delete';
        await api[method](`/api/users/${username}/likes/${songId}`);
        
        // Fetch fresh user data after like update
        const response = await api.get(`/api/users/${username}`);
        return response.data;
    } catch (error) {
        console.error('Toggle like error:', error.response?.data || error);
        throw new Error('Failed to update liked songs');
    }
};

export const addToPlaylist = async (username, playlistId, songId) => {
    try {
        const response = await api.post(`/api/users/${username}/playlists/${playlistId}/songs`, { songId });
        return response.data;
    } catch (error) {
        console.error('Add to playlist error:', error.response?.data || error);
        throw new Error('Failed to add song to playlist');
    }
};

export const getPlaylist = async (username, playlistId) => {
    try {
        const response = await api.get(`/api/users/${username}/playlists/${playlistId}`);
        return response.data;
    } catch (error) {
        console.error('Get playlist error:', error);
        throw new Error('Failed to fetch playlist');
    }
};

export default api;