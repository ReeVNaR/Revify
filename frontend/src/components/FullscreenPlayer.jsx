import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAudioNavigation } from '../hooks/useAudioNavigation';

const FullscreenPlayer = ({ onClose }) => {
    const { currentTrack, isPlaying, play, pause, audioRef, toggleRepeat, toggleShuffle, repeat, shuffle, liked, toggleLike } = useAudio();
    const { playNext, playPrevious } = useAudioNavigation();
    const [progress, setProgress] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchMove, setTouchMove] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isSliding, setIsSliding] = useState(false);
    const [currentTimeState, setCurrentTimeState] = useState(0);
    const [durationState, setDurationState] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        const updateTime = () => {
            setCurrentTimeState(audio.currentTime);
            setDurationState(audio.duration);
            setProgress((audio.currentTime / audio.duration) * 100 || 0);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateTime);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateTime);
        };
    }, []);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (e) => {
        const value = parseFloat(e.target.value);
        const newTime = (value / 100) * durationState;
        audioRef.current.currentTime = newTime;
        setProgress(value);
        setCurrentTimeState(newTime);
    };

    const handleSlideStart = () => {
        setIsSliding(true);
        audioRef.current.muted = true;
    };

    const handleSlideEnd = () => {
        setIsSliding(false);
        audioRef.current.muted = false;
    };

    const handleTouchMove = (e) => {
        if (!touchStart) return;
        const currentY = e.touches[0].clientY;
        const offset = Math.max(0, currentY - touchStart);
        setTouchMove(currentY);
        setSwipeOffset(offset);
    };

    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientY);
    };

    const handleTouchMoveGesture = (e) => {
        setTouchMove(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchMove) return;
        
        const swipeDistance = touchMove - touchStart;
        const minSwipeDistance = 100;

        if (swipeDistance > minSwipeDistance) {
            setIsClosing(true);
            setTimeout(() => {
                onClose();
            }, 300); // Match the transition duration
        } else {
            setSwipeOffset(0);
        }

        setTouchStart(null);
        setTouchMove(null);
    };

    if (!currentTrack) return null;

    return (
        <div 
            className={`fixed inset-0 bg-gradient-to-b from-[#535353] via-[#222222] to-[#121212] z-[60] text-white overflow-hidden transition-all duration-300`}
            style={{
                transform: `translateY(${swipeOffset}px)`,
                opacity: Math.max(0, 1 - (swipeOffset / window.innerHeight)),
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full" />
            {touchMove && touchStart && (
                <div 
                    className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-full transition-transform"
                    style={{
                        transform: `scaleY(${Math.min(
                            (touchMove - touchStart) / 100,
                            4
                        )})`
                    }}
                />
            )}
            <div className="absolute inset-0">
                <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `url(${currentTrack.coverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(100px) saturate(180%)'
                    }}
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            </div>

            <div className="relative h-full max-w-7xl mx-auto px-4 py-8">
                <div className="h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                    {/* Album Art with Shadow */}
                    <div className="w-full max-w-[400px] md:w-1/2 aspect-square relative">
                        <div className="absolute inset-0 blur-2xl opacity-40" style={{ backgroundImage: `url(${currentTrack.coverUrl})`, backgroundSize: 'cover' }} />
                        <img 
                            src={currentTrack.coverUrl}
                            alt={currentTrack.title}
                            className="relative w-full h-full object-cover rounded-md shadow-[0_32px_60px_-12px_rgba(0,0,0,0.8)]"
                        />
                    </div>

                    {/* Controls with Better Spacing */}
                    <div className="w-full md:w-1/2 max-w-[600px] flex flex-col items-center md:items-start gap-8">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">{currentTrack.title}</h1>
                            <p className="text-lg md:text-xl text-white/70 font-medium">{currentTrack.artist}</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full space-y-1">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={handleProgressChange}
                                onMouseDown={handleSlideStart}
                                onMouseUp={handleSlideEnd}
                                onTouchStart={handleSlideStart}
                                onTouchEnd={handleSlideEnd}
                                className="w-full h-2 rounded-full cursor-pointer appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white hover:[&::-moz-range-thumb]:bg-green-500 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/10"
                                style={{
                                    background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.1) ${progress}%)`
                                }}
                            />
                            <div className="flex justify-between text-xs font-medium text-white/60 px-1">
                                <span className="tabular-nums select-none">{formatTime(currentTimeState)}</span>
                                <span className="tabular-nums select-none">{formatTime(durationState)}</span>
                            </div>
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center justify-center gap-8 md:gap-10">
                            <button
                                onClick={toggleShuffle}
                                className={`p-2 hover:scale-110 transition-all ${shuffle ? 'text-green-500' : 'text-white/70'}`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                                </svg>
                            </button>
                            <button
                                onClick={() => playPrevious(false)}
                                className="text-white hover:scale-110 transition-all"
                            >
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                                </svg>
                            </button>
                            <button
                                onClick={() => isPlaying ? pause() : play(currentTrack)}
                                className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 hover:bg-white/90 transition-all shadow-xl"
                            >
                                {isPlaying ? (
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
                                onClick={() => playNext(false)}
                                className="text-white hover:scale-110 transition-all"
                            >
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                                </svg>
                            </button>
                            <button
                                onClick={toggleRepeat}
                                className={`p-2 hover:scale-110 transition-all ${repeat !== 'off' ? 'text-green-500' : 'text-white/70'}`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                                </svg>
                            </button>
                        </div>

                        {/* Like Button */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => toggleLike(currentTrack._id)}
                                className={`p-2 hover:scale-110 transition-all ${liked.has(currentTrack._id) ? 'text-green-500' : 'text-white/70'}`}
                            >
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* New position for close button */}
                <button 
                    onClick={onClose}
                    className="absolute bottom-8 right-8 p-3 hover:bg-white/10 rounded-full transition-colors bg-black/20 backdrop-blur-sm"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default FullscreenPlayer;
