import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAudioNavigation } from '../hooks/useAudioNavigation';

const FullscreenPlayer = ({ onClose }) => {
    const { currentTrack, isPlaying, play, pause, audioRef, toggleRepeat, toggleShuffle, repeat, shuffle, liked, toggleLike, currentTime, duration } = useAudio();
    const { playNext, playPrevious } = useAudioNavigation();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (duration) {
            setProgress((currentTime / duration) * 100);
        }
    }, [currentTime, duration]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - bounds.left) / bounds.width;
        audioRef.current.currentTime = percent * duration;
    };

    if (!currentTrack) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] z-[60] text-white overflow-hidden">
            <div className="absolute inset-0">
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `url(${currentTrack.coverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(30px)'
                    }}
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative h-full max-w-7xl mx-auto px-4 py-8">
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>

                <div className="h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                    {/* Album Art */}
                    <div className="w-full max-w-[500px] md:w-1/2 aspect-square">
                        <img 
                            src={currentTrack.coverUrl}
                            alt={currentTrack.title}
                            className="w-full h-full object-cover rounded-lg shadow-2xl"
                        />
                    </div>

                    {/* Controls */}
                    <div className="w-full md:w-1/2 max-w-[600px] flex flex-col items-center md:items-start gap-8">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">{currentTrack.title}</h1>
                            <p className="text-xl text-white/70">{currentTrack.artist}</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full space-y-2">
                            <div 
                                className="w-full h-1 bg-white/20 rounded-full cursor-pointer group"
                                onClick={handleProgressClick}
                            >
                                <div 
                                    className="h-full bg-white group-hover:bg-green-500 rounded-full relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <div className="flex justify-between text-sm text-white/60">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center justify-center gap-8">
                            <button
                                onClick={toggleShuffle}
                                className={`p-2 hover:text-white transition-colors ${shuffle ? 'text-green-500' : 'text-white/70'}`}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                                </svg>
                            </button>
                            <button
                                onClick={() => playPrevious(false)}
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                                </svg>
                            </button>
                            <button
                                onClick={() => isPlaying ? pause() : play(currentTrack)}
                                className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                {isPlaying ? (
                                    <svg className="w-8 h-8" fill="black" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-8 h-8 ml-1" fill="black" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={() => playNext(false)}
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                                </svg>
                            </button>
                            <button
                                onClick={toggleRepeat}
                                className={`p-2 hover:text-white transition-colors ${repeat !== 'off' ? 'text-green-500' : 'text-white/70'}`}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                                </svg>
                            </button>
                        </div>

                        {/* Extra Controls */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => toggleLike(currentTrack._id)}
                                className={`p-2 hover:text-white transition-colors ${liked.has(currentTrack._id) ? 'text-green-500' : 'text-white/70'}`}
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

export default FullscreenPlayer;
