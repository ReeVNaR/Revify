import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';

const Player = () => {
  const { 
    currentTrack, 
    isPlaying, 
    play, 
    pause, 
    playNext, 
    playPrevious, 
    volume, 
    setVolume,
    progress,
    duration,
    setProgress
  } = useAudio();
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (currentTrack) {
      setProgress(0); // Reset progress when a new track starts
    }
  }, [currentTrack, setProgress]);

  if (!currentTrack) return null;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#282828] px-4 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center w-[30%]">
          <img 
            src={currentTrack.coverUrl} 
            alt={currentTrack.title} 
            className="w-14 h-14 rounded"
          />
          <div className="ml-4">
            <h4 className="text-white text-sm">{currentTrack.title}</h4>
            <p className="text-gray-400 text-xs">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex flex-col items-center w-[40%]">
          <div className="flex items-center gap-4">
            <button
              onClick={playPrevious}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button
              onClick={() => isPlaying ? pause() : play(currentTrack)}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="black" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="black" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            <button
              onClick={playNext}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>
          <div className="w-full flex items-center gap-2">
            <span className="text-xs text-gray-400">{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={(e) => setProgress(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded-full appearance-none"
            />
            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end w-[30%]">
          <div
            className="relative"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className={`w-24 h-1 bg-gray-600 rounded-full appearance-none ${
                isVolumeHovered ? 'opacity-100' : 'opacity-50'
              } transition-opacity`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;