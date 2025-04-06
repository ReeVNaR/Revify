import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { fetchSongById } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SongView = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { play, pause, currentTrack, isPlaying, liked, toggleLike, user } = useAudio();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSong = async () => {
      try {
        setLoading(true);
        const data = await fetchSongById(songId);
        setSong(data);
      } catch (err) {
        console.error('Failed to load song:', err);
        setError('Failed to load song details');
      } finally {
        setLoading(false);
      }
    };

    loadSong();
  }, [songId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  if (!song) return <div className="text-white p-4 text-center">Song not found</div>;

  const handlePlayPause = () => {
    if (currentTrack?._id === song._id && isPlaying) {
      pause();
    } else {
      play(song);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/profile');
      return;
    }
    await toggleLike(song._id);
  };

  return (
    <div className="p-6 text-white">
      <div className="bg-gradient-to-b from-[#535353] to-[#121212] rounded-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img 
            src={song.coverUrl} 
            alt={song.title}
            className="w-64 h-64 object-cover rounded-lg shadow-2xl"
          />
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mt-4 md:mt-0">{song.title}</h1>
            <p className="text-xl text-gray-300 mt-2">{song.artist}</p>
            <p className="text-gray-400 mt-1">{song.genre}</p>
            
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handlePlayPause}
                className="px-8 py-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                {currentTrack?._id === song._id && isPlaying ? (
                  <>
                    <span>Pause</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Play</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </>
                )}
              </button>

              <button
                onClick={handleLike}
                className={`p-3 rounded-full transition-colors ${
                  liked.has(song._id) ? 'text-green-500' : 'text-white/70 hover:text-white'
                }`}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongView;
