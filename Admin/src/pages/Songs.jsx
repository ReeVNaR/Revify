import React, { useState, useEffect } from 'react';
import { getSongs, deleteSong } from '../services/api';

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSongs = async () => {
    try {
      const songData = await getSongs();
      setSongs(songData);
    } catch (err) {
      console.error('Error fetching songs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleDeleteSong = async (id) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        await deleteSong(id);
        await fetchSongs();
      } catch (err) {
        console.error('Error deleting song:', err);
        alert('Failed to delete song');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#1DB954] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-[#1DB954] text-3xl font-bold mb-6">Uploaded Songs</h1>
      <div className="space-y-4">
        {songs.map((song) => (
          <div 
            key={song._id} 
            className="flex items-center justify-between p-4 bg-[#282828] rounded-lg text-white hover:bg-[#2a2a2a] transition-colors"
          >
            <div className="flex items-center space-x-4">
              <img 
                src={song.coverUrl} 
                alt={song.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="font-bold">{song.title}</p>
                <p className="text-[#B3B3B3]">{song.artist}</p>
                <p className="text-sm text-[#1DB954]">{song.genre}</p>
              </div>
            </div>
            <button
              onClick={() => handleDeleteSong(song._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
        {songs.length === 0 && (
          <div className="text-center text-[#B3B3B3] py-8">
            No songs uploaded yet
          </div>
        )}
      </div>
    </div>
  );
}
