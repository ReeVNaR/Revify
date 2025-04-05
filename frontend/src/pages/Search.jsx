import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { songs, play, pause, currentTrack, isPlaying } = useAudio();
  const navigate = useNavigate();

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlayPause = (song, e) => {
    e.preventDefault();
    if (currentTrack?.audioUrl === song.audioUrl && isPlaying) {
      pause();
    } else {
      play(song);
    }
  };

  return (
    <div className="p-6 min-h-full">
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search for songs, artists, or genres..."
          className="w-full px-6 py-4 bg-[#282828] text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchTerm && (
        <div className="grid grid-cols-1 gap-2">
          {filteredSongs.map(song => (
            <div
              key={song._id}
              onClick={() => navigate(`/songs/${song._id}`)}
              className="flex items-center p-4 rounded-lg hover:bg-[#282828] group cursor-pointer"
            >
              <img
                src={song.coverUrl}
                alt={song.title}
                className="w-12 h-12 rounded mr-4"
              />
              <div className="flex-grow">
                <h3 className="text-white font-medium">{song.title}</h3>
                <p className="text-gray-400 text-sm">{song.artist} • {song.genre}</p>
              </div>
              <button
                onClick={(e) => handlePlayPause(song, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
                  <svg className="w-8 h-8" fill="white" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
