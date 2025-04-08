const API_URL = 'http://localhost:5000/api';

const defaultHeaders = {
  'Accept': 'application/json',
};

const defaultOptions = {
  credentials: 'include',
  headers: defaultHeaders,
};

const handleApiError = async (response) => {
  try {
    const errorData = await response.json();
    throw new Error(errorData.message || `API request failed (${response.status}): ${response.statusText}`);
  } catch (e) {
    if (e.message.includes('API request failed')) throw e;
    throw new Error(`Request failed (${response.status}): ${response.statusText}`);
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading file:', file.name, 'Size:', file.size);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      ...defaultOptions,
      body: formData,
    });

    if (!response.ok) {
      console.error('Upload failed with status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      await handleApiError(response);
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    return data;
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    throw error;
  }
};

export const createSong = async (songData) => {
  try {
    const response = await fetch(`${API_URL}/songs`, {
      method: 'POST',
      ...defaultOptions,
      headers: {
        ...defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(songData),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    console.error('Create song error:', error);
    throw error;
  }
};

export const getGenres = async () => {
  try {
    const response = await fetch(`${API_URL}/genres`, {
      ...defaultOptions,
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    console.error('Get genres error:', error);
    throw error;
  }
};

export const createGenre = async (genreData) => {
  try {
    const response = await fetch(`${API_URL}/genres`, {
      method: 'POST',
      ...defaultOptions,
      headers: {
        ...defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(genreData),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    console.error('Create genre error:', error);
    throw error;
  }
};

export const deleteGenre = async (genreId) => {
  try {
    const response = await fetch(`${API_URL}/genres/${genreId}`, {
      method: 'DELETE',
      ...defaultOptions,
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    console.error('Delete genre error:', error);
    throw error;
  }
};

export const getSongs = async () => {
  try {
    const response = await fetch(`${API_URL}/songs`, {
      ...defaultOptions,
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    console.error('Get songs error:', error);
    throw error;
  }
};

export const deleteSong = async (songId) => {
  try {
    const response = await fetch(`${API_URL}/songs/${songId}`, {
      method: 'DELETE',
      ...defaultOptions,
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    console.error('Delete song error:', error);
    throw error;
  }
};
