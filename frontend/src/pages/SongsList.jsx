import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

const SongsList = () => {
  const navigate = useNavigate();
  const { songs, play, pause, currentTrack, isPlaying, shuffle, shuffleAllSongs } = useAudio();

  const handlePlayPause = (song, e) => {
    e.preventDefault();
    if (currentTrack?.audioUrl === song.audioUrl && isPlaying) {
      pause();
    } else {
      play(song);
    }
  };

  const handleSongClick = (song) => {
    navigate(`/songs/${song._id}`);
  };

  return (
    <div className="p-6 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">All Songs</h2>
        <button
          onClick={shuffleAllSongs}
          className="px-4 py-2 bg-green-500 rounded-full hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
          </svg>
          Shuffle All
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {songs.map(song => (
          <div 
            key={song._id}
            onClick={() => handleSongClick(song)}
            className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group relative cursor-pointer"
          >
            <div className="relative mb-4 aspect-square">
              <img 
                src={song.coverUrl} 
                alt={song.title}
                className="w-full h-full object-cover rounded-md shadow-lg"
              />
              <button
                onClick={(e) => handlePlayPause(song, e)}
                className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 shadow-xl"
              >
                {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>
            <h3 className="font-semibold text-white mb-1 truncate">{song.title}</h3>
            <p className="text-sm text-gray-400 truncate">{song.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongsList;
