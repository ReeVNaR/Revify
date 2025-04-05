import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchSongs } from '../services/api';
import { useAudio } from '../context/AudioContext';

function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { play, pause, currentTrack, isPlaying } = useAudio();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const data = await fetchSongs();
        setSongs(data);
      } catch (err) {
        setError('Failed to load songs');
      } finally {
        setLoading(false);
      }
    };
    loadSongs();
  }, []);

  const handlePlayPause = (song) => {
    if (currentTrack?.audioUrl === song.audioUrl && isPlaying) {
      pause();
    } else {
      play(song);
    }
  };

  const handleSongClick = (song) => {
    navigate(`/songs/${song._id}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#121212]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center text-red-500 p-4 bg-[#121212]">{error}</div>
  );

  return (
    <div className="px-6 py-4 min-h-full">
      <h1 className="text-2xl font-bold text-white mb-6">Welcome</h1>
      
      {/* Recently Played Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {songs.slice(0, 6).map((song) => (
          <div 
            key={song._id}
            onClick={() => handleSongClick(song)}
            className="bg-[#282828] hover:bg-[#2A2A2A] transition-colors group relative rounded-md overflow-hidden cursor-pointer"
          >
            <div className="flex items-center gap-4 p-4">
              <img 
                src={song.coverUrl}
                alt={song.title}
                className="w-12 h-12 rounded shadow"
              />
              <h3 className="font-bold text-white truncate">{song.title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause(song);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-green-500 rounded-full shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
          </div>
        ))}
      </div>

      {/* Made for you Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Made for you</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {songs.filter(song => song.genre === "Pop").slice(0, 5).map((song) => (
            <div 
              key={song._id}
              onClick={() => handleSongClick(song)}
              className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group relative"
            >
              <div className="relative mb-4">
                <img 
                  src={song.coverUrl} 
                  alt={song.title}
                  className="w-full aspect-square object-cover rounded-md shadow-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause(song);
                  }}
                  className="absolute bottom-2 right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                >
                  {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
                    <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              <h3 className="font-semibold text-white mb-1 truncate">{song.title}</h3>
              <p className="text-sm text-gray-400">{song.artist}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Added Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Recently added</h2>
        <div className="bg-[#181818] rounded-lg overflow-hidden">
          {songs.map((song, index) => (
            <div 
              key={song._id}
              className="flex items-center px-4 py-3 hover:bg-[#282828] group transition-all duration-300 cursor-pointer"
              onClick={() => handleSongClick(song)}
            >
              <div className="w-12 text-gray-400 text-right pr-4">{index + 1}</div>
              <div className="w-12 h-12 mr-4">
                <img 
                  src={song.coverUrl} 
                  alt={`${song.title} cover`} 
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-white">{song.title}</h3>
                <p className="text-sm text-gray-400">{song.artist}</p>
              </div>
              <div className="text-sm text-gray-400 mr-4">{song.genre}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause(song);
                }}
                className="w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
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
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
