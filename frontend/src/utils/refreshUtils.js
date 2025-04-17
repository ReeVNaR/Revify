import axios from 'axios';

const REFRESH_INTERVAL = 30000; // 30 seconds
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const setupAutoRefresh = () => {
  const refreshWebsite = async () => {
    try {
      await axios.get(`${API_URL}/api/ping`);
      console.log('Website refreshed at:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  refreshWebsite(); // Initial refresh
  const intervalId = setInterval(refreshWebsite, REFRESH_INTERVAL);
  
  return () => clearInterval(intervalId);
};
