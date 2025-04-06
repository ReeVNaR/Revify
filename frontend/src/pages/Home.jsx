import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchSongs } from '../services/api';
import { useAudio } from '../context/AudioContext';

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
    <div className="px-6 py-4 min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome {user?.username ? `, ${user.username}` : ''}
        </h1>
        <p className="text-gray-400 mt-2">
          {user ? 'Discover your favorite music' : 'Sign in to start listening'}
        </p>
      </div>
      
      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Recently Played</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyPlayed.slice(0, 8).map((song) => (
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
        </section>
      )}

      {/* Made for you Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Made for you</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {randomSongs.map((song) => (
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
      </section>

      {/* Playlists Section */}
      {user && playlists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Your Playlists</h2>
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
