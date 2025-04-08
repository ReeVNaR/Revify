import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchSongs } from '../services/api';
import { useAudio } from '../context/AudioContext';

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

const getShiftingClass = (text) => {
  return text.length > 25 ? 'truncate' : 'truncate';
};

function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { play, pause, currentTrack, isPlaying, user, playlists, recentlyPlayed } = useAudio();
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

  // Add random songs selector with title length filter
  const randomSongs = useMemo(() => {
    if (!songs.length) return [];
    const filteredSongs = songs.filter(song => song.title.length <= 25);
    const shuffled = filteredSongs.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [songs]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#121212]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center text-red-500 p-4 bg-[#121212]">{error}</div>
  );

  return (
    <div className="px-4 md:px-6 py-4 min-h-full bg-gradient-to-b from-[#1a1a1a] to-[#121212] overflow-x-hidden">
      {/* Welcome Header */}
      <div className="mb-6 md:mb-8 bg-gradient-to-b from-[#3333AA] to-transparent p-4 md:p-8 -mx-4 md:-mx-6 -mt-4 flex items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-6xl font-bold text-white">
            {user?.username ? `Good ${getTimeOfDay()}, ${user.username}` : 'Welcome'}
          </h1>
          <p className="text-gray-200 mt-2 md:mt-4 text-sm md:text-xl">
            {user ? 'Jump back in' : 'Sign in to start listening'}
          </p>
        </div>
      </div>

      {/* Recently Played Section - Mobile Optimized */}
      {recentlyPlayed.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">Recently Played</h2>
            <Link to="/history" className="text-sm text-gray-400 hover:underline md:hidden">See all</Link>
          </div>
          {/* Mobile Horizontal Scroll */}
          <div className="md:hidden flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <div 
                key={song._id}
                onClick={() => handleSongClick(song)}
                className="flex-shrink-0 w-32"
              >
                <div className="relative mb-2">
                  <img 
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-32 h-32 object-cover rounded-md shadow-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPause(song);
                    }}
                    className="absolute right-2 bottom-2 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl"
                  >
                    {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
                      <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
                <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
                <p className="text-xs text-gray-400 truncate">{song.artist}</p>
              </div>
            ))}
          </div>
          {/* Desktop Grid - Keep existing code */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <div 
                key={song._id}
                onClick={() => handleSongClick(song)}
                className="bg-[#181818] hover:bg-[#282828] p-3 md:p-4 rounded-md transition-all duration-300 group cursor-pointer relative w-full"
              >
                <div className="relative mb-2 md:mb-4">
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
                    className="absolute right-2 bottom-2 w-10 h-10 bg-[#1DB954] rounded-full shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 z-10"
                  >
                    {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
                      <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="w-full">
                  <h3 className="font-bold text-white mb-1 truncate max-w-full block">
                    {song.title}
                  </h3>
                  <p className="text-sm text-gray-400 truncate max-w-full block">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
          {/* List view for mobile */}
          <div className="md:hidden space-y-2 w-full">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <div 
                key={song._id}
                onClick={() => handleSongClick(song)}
                className="flex items-center p-2 hover:bg-[#282828] rounded-md transition-all w-full"
              >
                <img 
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0 mx-3">
                  <h3 className="font-semibold text-white text-sm truncate">
                    {song.title}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause(song);
                  }}
                  className="p-2 flex-shrink-0"
                >
                  {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
                    <svg className="w-6 h-6 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Made for you Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white hover:underline cursor-pointer">Made for you</h2>
        </div>
        {/* Grid view for tablet and desktop */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {randomSongs.map((song) => (
            <div 
              key={song._id}
              onClick={() => handleSongClick(song)}
              className="bg-[#181818] p-3 md:p-4 rounded-md hover:bg-[#282828] transition-all duration-300 group relative w-full"
            >
              <div className="relative mb-2 md:mb-4">
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
                  className="absolute bottom-2 right-2 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center group-hover:opacity-100 transition-all duration-300 shadow-xl z-10"
                >
                  {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
                    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="w-full">
                <h3 className="font-semibold text-white mb-1 truncate max-w-full block">
                  {song.title}
                </h3>
                <p className="text-sm text-gray-400 truncate max-w-full block">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
        {/* List view for mobile */}
        <div className="md:hidden space-y-2">
          {randomSongs.map((song) => (
            <div 
              key={song._id}
              className="flex items-center space-x-3 p-2 hover:bg-[#282828] rounded-md transition-all"
            >
              <img 
                src={song.coverUrl}
                alt={song.title}
                className="w-12 h-12 rounded object-cover cursor-pointer"
                onClick={() => handleSongClick(song)}
              />
              <div 
                className="flex-grow min-w-0 overflow-hidden cursor-pointer"
                onClick={() => handlePlayPause(song)}
              >
                <h3 className={`font-semibold text-white text-sm ${getShiftingClass(song.title)}`}>
                  {song.title}
                </h3>
                <p className="text-xs text-gray-400 truncate">{song.artist}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause(song);
                }}
                className="p-2"
              >
                {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
                  <svg className="w-6 h-6 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Playlists Section */}
      {user && playlists.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">Your Playlists</h2>
            <Link to="/playlists" className="text-sm text-gray-400 hover:underline md:hidden">See all</Link>
          </div>
          {/* Mobile Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {playlists.map((playlist) => (
              <div 
                key={playlist._id}
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className="bg-[#181818] p-3 md:p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group relative"
              >
                <div className="relative mb-4 aspect-square bg-[#282828] rounded-lg shadow-lg overflow-hidden">
                  {playlist.songs?.length > 0 ? (
                    <div className="grid grid-cols-2 w-full h-full">
                      {playlist.songs.slice(0, 4).map((song, idx) => (
                        <div 
                          key={song._id} 
                          className={`relative w-full h-full ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}
                        >
                          <img 
                            src={song.coverUrl} 
                            alt=""
                            className="w-full h-full object-cover"
                            style={{
                              filter: idx === 0 ? 'none' : 'brightness(0.7)'
                            }}
                          />
                          <div className="absolute inset-0 bg-black/10"/>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                      <svg className="w-1/2 h-1/2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playlist.songs?.length > 0) {
                          play(playlist.songs[0]);
                        }
                      }}
                      className="w-12 h-12 bg-[#1DB954] rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
                      disabled={!playlist.songs?.length}
                    >
                      <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <h3 className="font-bold text-white mb-1 truncate">{playlist.name}</h3>
                  <p className="text-sm text-gray-400">
                    {playlist.songs?.length 
                      ? `${playlist.songs.length} ${playlist.songs.length === 1 ? 'song' : 'songs'}`
                      : 'Empty playlist'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
