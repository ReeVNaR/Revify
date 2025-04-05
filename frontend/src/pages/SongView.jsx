import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { fetchSongById } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAudioNavigation } from '../hooks/useAudioNavigation';

const SongView = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { play, pause, currentTrack, isPlaying, songs } = useAudio();
  const { playNext, playPrevious } = useAudioNavigation();
  const [dominantColor, setDominantColor] = useState('rgb(83, 83, 83)');
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
        setError('Failed to load song');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSong();
  }, [songId]);

  const currentIndex = songs.findIndex(song => song._id === songId);
  const relatedSongs = songs.filter(song => 
    song.genre === song?.genre && song._id !== songId
  ).slice(0, 6);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleNext = () => {
    playNext(true); // Pass true to enable navigation
  };

  const handlePrevious = () => {
    playPrevious(true); // Pass true to enable navigation
  };

  useEffect(() => {
    if (song?.coverUrl) {
      // Create a subtle gradient based on image
      setDominantColor('rgb(83, 83, 83)'); // Default fallback
    }
  }, [song]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!song) return null;

  return (
    <div className="relative min-h-full">
      {/* Background Gradient */}
      <div 
        className="absolute top-0 left-0 right-0 h-[400px] transition-colors duration-1000"
        style={{
          background: `linear-gradient(to bottom, ${dominantColor}, rgb(18, 18, 18))`
        }}
      />
      
      {/* Back Button */}
      <button 
        onClick={handleBackClick}
        className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div className="relative min-h-full px-4 md:px-8 pt-12 pb-8">
        {/* Main Song Info */}
        <div className="flex flex-col md:flex-row items-start gap-8">
          <img 
            src={song.coverUrl} 
            alt={song.title}
            className="w-64 h-64 md:w-[300px] md:h-[300px] object-cover rounded-lg shadow-2xl"
          />
          
          <div className="flex flex-col justify-end py-6">
            <span className="text-sm font-bold text-white/80">Song</span>
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 mt-2">
              {song.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <img 
                  src={song.coverUrl} 
                  alt={song.artist}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-bold hover:underline cursor-pointer">
                  {song.artist}
                </span>
              </div>
              <span>•</span>
              <span>{song.genre}</span>
              <span>•</span>
              <span>Song {currentIndex + 1} of {songs.length}</span>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="mt-8 flex items-center gap-6">
          <button
            onClick={handlePrevious}
            className="w-10 h-10 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          
          <button
            onClick={() => isPlaying ? pause() : play(song)}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg hover:bg-white/90"
          >
            {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
              <svg className="w-7 h-7" fill="black" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-7 h-7 ml-1" fill="black" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button
            onClick={handleNext}
            className="w-10 h-10 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
          
          <button 
            className="text-white/70 hover:text-green-400 transition-colors"
            title="Like"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>

        {/* Related Songs Section */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-white mb-6">More like this</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedSongs.map(song => (
              <div 
                key={song._id}
                onClick={() => navigate(`/songs/${song._id}`)}
                className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-lg cursor-pointer"
              >
                <img 
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-full aspect-square object-cover rounded-md mb-4"
                />
                <h3 className="text-white font-semibold text-sm truncate">{song.title}</h3>
                <p className="text-white/60 text-xs truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SongView;
