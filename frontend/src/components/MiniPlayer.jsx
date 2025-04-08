import React, { useState, useEffect, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAudioNavigation } from '../hooks/useAudioNavigation';
import { useNavigate } from 'react-router-dom';
import FullscreenPlayer from './FullscreenPlayer';

const MiniPlayer = () => {
    const { 
        currentTrack, 
        isPlaying, 
        play, 
        pause, 
        audioRef,  // Use this single audioRef from context
        toggleRepeat, 
        toggleShuffle, 
        repeat, 
        shuffle, 
        liked, 
        toggleLike 
    } = useAudio();
    
    const { playNext, playPrevious } = useAudioNavigation();
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showVolume, setShowVolume] = useState(false);
    const [volume, setVolume] = useState(() => {
        const savedVolume = localStorage.getItem('volume');
        return savedVolume ? parseFloat(savedVolume) : 1;
    });
    const [touchStart, setTouchStart] = useState(null);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [isSliding, setIsSliding] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(null);
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

    // Handle audio state restoration
    useEffect(() => {
        if (currentTrack && audioRef.current) {
            const savedTime = localStorage.getItem('audioTime');
            if (savedTime) {
                audioRef.current.currentTime = parseFloat(savedTime);
                setCurrentTime(parseFloat(savedTime));
                updateProgress();
            }
        }
    }, [currentTrack]);

    useEffect(() => {
        const audio = audioRef.current;
        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            updateProgress();
        };

        audio.addEventListener('timeupdate', updateTime);
        return () => {
            audio.removeEventListener('timeupdate', updateTime);
        };
    }, [updateProgress]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = useCallback((e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - bounds.left) / bounds.width;
        const audio = audioRef.current;
        
        if (audio && duration) {
            const newTime = percent * duration;
            audio.currentTime = newTime;
            setCurrentTime(newTime);
            setProgress(percent * 100);
        }
    }, [duration, audioRef]);

    const handleProgressMouseDown = () => {
        setPreviousVolume(audioRef.current.volume);
        audioRef.current.volume = 0;
        setIsSliding(true);
    };

    const handleProgressMouseUp = () => {
        if (previousVolume !== null) {
            audioRef.current.volume = previousVolume;
            setPreviousVolume(null);
        }
        setIsSliding(false);
    };

    // Modify handleProgressChange to handle range input changes
    const handleProgressChange = useCallback((e) => {
        const newProgress = parseFloat(e.target.value);
        const newTime = (newProgress / 100) * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        setProgress(newProgress);
    }, [duration]);

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

    const handleCoverClick = (e) => {
        e.stopPropagation();
        setIsFullscreen(true);
    };

    const handlePlayPause = useCallback(() => {
        if (!currentTrack) return;
        
        console.log('PlayPause:', { isPlaying, trackId: currentTrack._id });
        
        if (isPlaying) {
            pause();
        } else {
            play(currentTrack);
        }
    }, [currentTrack, isPlaying, play, pause]);

    const EmptyState = () => (
        <div className="flex items-center min-w-[180px] max-w-[300px] w-[30%]">
            <div className="w-14 h-14 bg-[#282828] rounded shadow-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
            </div>
            <div className="ml-4">
                <div className="h-4 w-32 bg-[#282828] rounded"></div>
                <div className="h-3 w-24 bg-[#282828] rounded mt-2"></div>
            </div>
        </div>
    );

    // Update progress tracking
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            // Reset progress when new track loads
            setProgress(0);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [audioRef]);

    // Single volume initialization effect
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const savedVolume = localStorage.getItem('volume');
        const initialVolume = savedVolume ? parseFloat(savedVolume) : 1;
        setVolume(initialVolume);
        audio.volume = initialVolume;

        return () => {
            localStorage.setItem('volume', volume.toString());
        };
    }, []);

    // Single volume change handler
    const handleVolumeChange = useCallback((e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
        localStorage.setItem('volume', newVolume.toString());
    }, [audioRef]);

    // Add effect to handle track changes
    useEffect(() => {
        if (currentTrack && isPlaying) {
            play(currentTrack);
        }
    }, [currentTrack?._id]); // Only trigger on track ID change

    const getVolumeIcon = () => {
        if (volume === 0) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
            );
        } else if (volume < 0.5) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
            );
        } else {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
            );
        }
    };

    const handleVolumeClick = useCallback(() => {
        const newVolume = volume === 0 ? 1 : 0;
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
        localStorage.setItem('volume', newVolume.toString());
    }, [volume]);

    const handleTouchStart = (e) => {
        setTouchStart({
            x: e.touches[0].clientX,
            time: Date.now()
        });
    };

    const handleTouchEnd = (e) => {
        if (!touchStart || !currentTrack) return;

        const touchEnd = e.changedTouches[0].clientX;
        const distance = touchEnd - touchStart.x;
        const time = Date.now() - touchStart.time;
        
        // Only trigger if swipe is fast enough and long enough
        if (Math.abs(distance) > 50 && time < 300) {
            if (distance > 0) {
                setSwipeDirection('right');
                playPrevious(false);
            } else {
                setSwipeDirection('left');
                playNext(false);
            }

            // Reset swipe direction after animation
            setTimeout(() => setSwipeDirection(null), 200);
        }
        setTouchStart(null);
    };

    return (
        <>
            <div className="fixed bottom-[4rem] md:bottom-0 left-0 right-0 h-24 bg-[#181818] border-t border-[#282828] px-4 backdrop-blur-lg bg-opacity-95 z-50">
                <div className="max-w-screen-2xl mx-auto h-full flex items-center justify-between gap-4">
                    {/* Mobile View */}
                    <div 
                        className="flex md:hidden w-full items-center justify-between"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {currentTrack ? (
                            <>
                                <div 
                                    onClick={handleSongInfoClick}
                                    className={`flex items-center flex-1 cursor-pointer transition-transform duration-200 ${
                                        swipeDirection === 'left' 
                                            ? '-translate-x-full' 
                                            : swipeDirection === 'right' 
                                                ? 'translate-x-full' 
                                                : ''
                                    }`}
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
                                <button 
                                    onClick={handlePlayPause}
                                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform ml-4"
                                >
                                    {isPlaying ? (
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="black">
                                            <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 ml-0.5" viewBox="0 0 16 16" fill="black">
                                            <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/>
                                        </svg>
                                    )}
                                </button>
                            </>
                        ) : (
                            <EmptyState />
                        )}
                    </div>

                    {/* Desktop View - Hide on mobile */}
                    <div className="hidden md:flex w-full items-center justify-between gap-4">
                        {/* Left Section - Track Info */}
                        {currentTrack ? (
                            <div className="flex items-center min-w-[180px] max-w-[300px] w-[30%]">
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
                        ) : (
                            <EmptyState />
                        )}

                        {/* Center Section - Player Controls */}
                        <div className="flex flex-col items-center max-w-[40%] w-full">
                            <div className="flex items-center gap-6 mb-2">
                                <button onClick={handlePreviousClick} className="text-[#b3b3b3] hover:text-white transition-colors">
                                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={handlePlayPause}
                                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                                    disabled={!currentTrack}
                                >
                                    {isPlaying ? (
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="black">
                                            <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 ml-0.5" viewBox="0 0 16 16" fill="black">
                                            <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/>
                                        </svg>
                                    )}
                                </button>
                                <button onClick={handleNextClick} className="text-[#b3b3b3] hover:text-white transition-colors">
                                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"/>
                                    </svg>
                                </button>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full flex items-center gap-2 text-[11px] text-gray-400">
                                <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
                                <div className="flex-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={progress}
                                        onChange={handleProgressChange}
                                        onMouseDown={handleProgressMouseDown}
                                        onMouseUp={handleProgressMouseUp}
                                        onTouchStart={handleProgressMouseDown}
                                        onTouchEnd={handleProgressMouseUp}
                                        className="w-full h-1 rounded-full appearance-none cursor-pointer bg-[#4d4d4d]"
                                        style={{
                                            backgroundImage: `linear-gradient(to right, white ${progress}%, #4d4d4d ${progress}%)`
                                        }}
                                    />
                                </div>
                                <span className="w-10 tabular-nums">{formatTime(duration || 0)}</span>
                            </div>
                        </div>

                        {/* Right Section - Volume & Additional Controls */}
                        <div className="flex items-center justify-end gap-4 min-w-[180px] w-[30%]">
                            {/* Additional controls (shuffle, repeat) */}
                            <div className="flex items-center gap-2">
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

                            {/* Volume control */}
                            <div className="flex items-center gap-2">
                                <button onClick={handleVolumeClick} className="text-gray-400 hover:text-white">
                                    {getVolumeIcon()}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-24 h-1 rounded-full appearance-none cursor-pointer bg-[#4d4d4d]"
                                    style={{
                                        backgroundImage: `linear-gradient(to right, white ${volume * 100}%, #4d4d4d ${volume * 100}%)`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isFullscreen && currentTrack && <FullscreenPlayer onClose={() => setIsFullscreen(false)} />}
        </>
    );
};

export default MiniPlayer;
