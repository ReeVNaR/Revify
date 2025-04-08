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

  // Add random songs selector
  const randomSongs = useMemo(() => {
    if (!songs.length) return [];
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
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
    <div className="px-6 py-4 min-h-full bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
      <div className="mb-8 bg-gradient-to-b from-[#3333AA] to-transparent p-8 -mx-6 -mt-4">
        <h1 className="text-3xl md:text-6xl font-bold text-white">
          {user?.username ? `Good ${getTimeOfDay()}, ${user.username}` : 'Welcome'}
        </h1>
        <p className="text-gray-200 mt-4 text-base md:text-xl">
          {user ? 'Jump back in' : 'Sign in to start listening'}
        </p>
      </div>
      
      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white hover:underline cursor-pointer">Recently Played</h2>
            <span className="text-gray-400 text-sm font-bold hover:underline cursor-pointer">Show all</span>
          </div>
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <div 
                key={song._id}
                onClick={() => handleSongClick(song)}
                className="bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-all duration-300 group cursor-pointer"
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
                    className="absolute right-2 bottom-2 w-12 h-12 bg-[#1DB954] rounded-full shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
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
                <h3 className="font-bold text-white truncate mb-1">{song.title}</h3>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            ))}
          </div>
          <div className="md:hidden">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <div 
                key={song._id}
                onClick={() => handlePlayPause(song)}
                className="flex items-center p-2 hover:bg-[#282828] rounded-md transition-all group"
              >
                <img 
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-12 h-12 rounded-md mr-3"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-white truncate">{song.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                </div>
                <button className="w-10 h-10 flex items-center justify-center">
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
          <span className="text-gray-400 text-sm font-bold hover:underline cursor-pointer">Show all</span>
        </div>
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {randomSongs.map((song) => (
            <div 
              key={song._id}
              onClick={() => handleSongClick(song)}
              className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-all duration-300 group relative"
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
                  className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
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
              <p className="text-sm text-gray-400">{song.artist}</p>
            </div>
          ))}
        </div>
        <div className="md:hidden">
          {randomSongs.map((song) => (
            <div 
              key={song._id}
              onClick={() => handlePlayPause(song)}
              className="flex items-center p-2 hover:bg-[#282828] rounded-md transition-all group"
            >
              <img 
                src={song.coverUrl}
                alt={song.title}
                className="w-12 h-12 rounded-md mr-3"
              />
              <div className="flex-grow">
                <h3 className="font-semibold text-white truncate">{song.title}</h3>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
              <button className="w-10 h-10 flex items-center justify-center">
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
            <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">Your Playlists</h2>
            <span className="text-gray-400 text-sm font-bold hover:underline cursor-pointer">Show all</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <div 
                key={playlist._id}
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group relative cursor-pointer"
              >
                <div className="relative mb-4 aspect-square bg-[#282828] rounded-md flex items-center justify-center">
                  {playlist.songs?.length > 0 ? (
                    <div className="grid grid-cols-2 w-full h-full">
                      {playlist.songs.slice(0, 4).map((song, idx) => (
                        <img 
                          key={song._id}
                          src={song.coverUrl} 
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  )}
                </div>
                <h3 className="font-semibold text-white mb-1 truncate">{playlist.name}</h3>
                <p className="text-sm text-gray-400">{playlist.songs?.length || 0} songs</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
