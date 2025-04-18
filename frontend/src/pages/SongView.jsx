import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { fetchSongById } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SongView = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { play, pause, currentTrack, isPlaying, liked, toggleLike, user, songs } = useAudio();  // Add songs from context
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedSongs, setRelatedSongs] = useState([]);
  const [randomSongs, setRandomSongs] = useState([]);

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

  useEffect(() => {
    if (song && songs) {
      // Get songs by same artist (excluding current song)
      const artistSongs = songs
        .filter(s => s.artist === song.artist && s._id !== song._id)
        .slice(0, 4);
      setRelatedSongs(artistSongs);

      // Get random songs (excluding current song and artist songs)
      const otherSongs = songs
        .filter(s => s.artist !== song.artist && s._id !== song._id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      setRandomSongs(otherSongs);
    }
  }, [song, songs]);

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
      <button
        onClick={() => navigate(-1)}
        className="mb-4 p-2 hover:bg-[#282828] rounded-full transition-colors"
        aria-label="Go back"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>

      <div className="bg-gradient-to-b from-[#535353] to-[#121212] rounded-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img 
            src={song.coverUrl} 
            alt={song.title}
            className="w-64 h-64 object-cover rounded-lg shadow-2xl cursor-pointer transition-transform hover:scale-105"
            onClick={() => play(song)}
          />
          <div className="flex-grow">
            <div className="cursor-pointer hover:opacity-80" onClick={() => play(song)}>
              <h1 className="text-4xl md:text-6xl font-bold mt-4 md:mt-0">{song.title}</h1>
              <p className="text-xl text-gray-300 mt-2">{song.artist}</p>
              <p className="text-gray-400 mt-1">{song.genre}</p>
            </div>
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

      {/* Related Songs Section */}
      {relatedSongs.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">More from {song.artist}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedSongs.map(song => (
              <div 
                key={song._id}
                onClick={() => navigate(`/songs/${song._id}`)}
                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 cursor-pointer"
              >
                <div className="relative mb-4 aspect-square">
                  <img 
                    src={song.coverUrl} 
                    alt={song.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <h3 className="font-semibold text-white truncate">{song.title}</h3>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-center mb-8">No related songs found.</div>
      )}

      {/* Random Songs Section */}
      {randomSongs.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {randomSongs.map(song => (
              <div 
                key={song._id}
                onClick={() => navigate(`/songs/${song._id}`)}
                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 cursor-pointer"
              >
                <div className="relative mb-4 aspect-square">
                  <img 
                    src={song.coverUrl} 
                    alt={song.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <h3 className="font-semibold text-white truncate">{song.title}</h3>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-center mb-8">No recommendations available.</div>
      )}
    </div>
  );
};

export default SongView;
