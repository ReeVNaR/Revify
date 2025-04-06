import React, { useState, useEffect, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAudioNavigation } from '../hooks/useAudioNavigation';
import { useNavigate } from 'react-router-dom';
import FullscreenPlayer from './FullscreenPlayer';

const MiniPlayer = () => {
    const { currentTrack, isPlaying, play, pause, audioRef, toggleRepeat, toggleShuffle, repeat, shuffle, liked, toggleLike } = useAudio();
    const { playNext, playPrevious } = useAudioNavigation();
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showVolume, setShowVolume] = useState(false);
    const [volume, setVolume] = useState(1);
    const navigate = useNavigate();

    const updateProgress = useCallback(() => {
        if (duration) {
            const currentProgress = (currentTime / duration) * 100;
            setProgress(currentProgress);
        }
    }, [currentTime, duration]);

    useEffect(() => {
        const audio = audioRef.current;
        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            updateProgress();
        };
        const updateDuration = () => {
            setDuration(audio.duration || 0);
            updateProgress();
        };
        const handleEnded = () => {
            if (repeat === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else {
                playNext(false);
            }
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('playing', updateDuration);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('playing', updateDuration);
        };
    }, [repeat, playNext, updateProgress]);

    useEffect(() => {
        const savedVolume = localStorage.getItem('volume');
        if (savedVolume) {
            setVolume(parseFloat(savedVolume));
        }
    }, []);

    // Add effect to sync with audio state
    useEffect(() => {
        const audio = audioRef.current;
        const updatePlayingState = () => setIsPlaying(!audio.paused);
        
        audio.addEventListener('play', updatePlayingState);
        audio.addEventListener('pause', updatePlayingState);
        
        return () => {
            audio.removeEventListener('play', updatePlayingState);
            audio.removeEventListener('pause', updatePlayingState);
        };
    }, []);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - bounds.left) / bounds.width;
        if (duration) {
            audioRef.current.currentTime = percent * duration;
            setCurrentTime(percent * duration);
            setProgress(percent * 100);
        }
    };

    const handleSongInfoClick = () => {
        navigate(`/songs/${currentTrack._id}`);
    };

    const handleNextClick = (e) => {
        e.stopPropagation();
        playNext(false); // Pass false to disable navigation
    };

    const handlePreviousClick = (e) => {
        e.stopPropagation();
        playPrevious(false); // Pass false to disable navigation
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        localStorage.setItem('volume', newVolume);
    };

    const handleCoverClick = (e) => {
        e.stopPropagation();
        setIsFullscreen(true);
    };

    if (!currentTrack) return null;

    return (
        <>
            <div className="fixed bottom-[4rem] md:bottom-0 left-0 right-0 h-24 bg-[#181818] border-t border-[#282828] px-4 backdrop-blur-lg bg-opacity-95 z-50">
                <div className="max-w-screen-2xl mx-auto h-full flex items-center justify-between gap-4">
                    {/* Track Info */}
                    <div 
                        onClick={handleSongInfoClick}
                        className="flex items-center min-w-[180px] max-w-[300px] w-[30%] cursor-pointer"
                    >
                        <img 
                            src={currentTrack.coverUrl} 
                            alt={currentTrack.title} 
                            className="w-14 h-14 rounded shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={handleCoverClick}
                        />
                        <div className="ml-4 overflow-hidden">
                            <h4 className="text-sm text-white font-medium truncate hover:underline cursor-pointer">
                                {currentTrack.title}
                            </h4>
                            <p className="text-xs text-gray-400 truncate hover:underline cursor-pointer">
                                {currentTrack.artist}
                            </p>
                        </div>
                    </div>

                    {/* Player Controls */}
                    <div className="flex flex-col items-center max-w-[40%] w-full">
                        <div className="flex items-center gap-4 mb-2">
                            <button onClick={handlePreviousClick} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
                                </svg>
                            </button>
                            <button onClick={() => isPlaying ? pause() : play(currentTrack)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                                {isPlaying ? (
                                    <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 ml-0.5" fill="black" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                )}
                            </button>
                            <button onClick={handleNextClick} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
                                </svg>
                            </button>
                        </div>
                        <div className="w-full flex items-center gap-2 text-[11px] text-gray-400">
                            <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
                            <div 
                                className="flex-1 h-1 group bg-gray-600 rounded-full cursor-pointer"
                                onClick={handleProgressClick}
                            >
                                <div 
                                    className="h-full bg-white group-hover:bg-green-500 rounded-full relative transition-all duration-200"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-opacity duration-200" />
                                </div>
                            </div>
                            <span className="w-10 tabular-nums">{formatTime(duration || 0)}</span>
                        </div>
                    </div>

                    {/* Volume Controls */}
                    <div className="flex items-center justify-end min-w-[180px] w-[30%]">
                        <div className="relative ml-4">
                            <button
                                onMouseEnter={() => setShowVolume(true)}
                                onMouseLeave={() => setShowVolume(false)}
                                className="text-gray-400 hover:text-white p-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                </svg>
                            </button>
                            {showVolume && (
                                <div
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-[#282828] rounded-lg shadow-lg"
                                    onMouseEnter={() => setShowVolume(true)}
                                    onMouseLeave={() => setShowVolume(false)}
                                >
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => toggleLike(currentTrack._id)}
                            className={`text-gray-400 hover:text-white ${
                                liked.has(currentTrack._id) ? 'text-green-500' : ''
                            }`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                        <button
                            onClick={toggleShuffle}
                            className={`text-gray-400 hover:text-white ${shuffle ? 'text-green-500' : ''}`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                            </svg>
                        </button>
                        <button
                            onClick={toggleRepeat}
                            className={`text-gray-400 hover:text-white ${repeat !== 'off' ? 'text-green-500' : ''}`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {isFullscreen && <FullscreenPlayer onClose={() => setIsFullscreen(false)} />}
        </>
    );
};

export default MiniPlayer;
