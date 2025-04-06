const API_URL = 'http://localhost:5000/api';

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Upload failed');
  }

  return response.json();
};

export const createSong = async (songData) => {
  const response = await fetch(`${API_URL}/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(songData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Server response:', errorData);
    throw new Error(errorData.message || 'Failed to save song');
  }

  return response.json();
};

export const getGenres = async () => {
    const response = await fetch(`${API_URL}/genres`);
    return response.json();
};

export const createGenre = async (genreData) => {
    const response = await fetch(`${API_URL}/genres`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(genreData),
    });
    return response.json();
};

export const deleteGenre = async (genreId) => {
    const response = await fetch(`${API_URL}/genres/${genreId}`, {
        method: 'DELETE',
    });
    return response.json();
};

export const getSongs = async () => {
    const response = await fetch(`${API_URL}/songs`);
    return response.json();
};

export const deleteSong = async (songId) => {
    const response = await fetch(`${API_URL}/songs/${songId}`, {
        method: 'DELETE',
    });
    return response.json();
};
