import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import AudioControls from '../components/AudioControls';
import ProgressBar from '../components/ProgressBar';
import { useAudio } from '../context/AudioContext';

const AudioPlayer = memo(function AudioPlayer() {
    const [audioFile, setAudioFile] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [coverImage, setCoverImage] = useState(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const audioRef = useRef(null);

    const handleFileSelect = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsProcessing(true);
            setIsPlaying(false);
            setCurrentTime(0);
            
            // Create local URL for the file
            const localUrl = URL.createObjectURL(file);
            setAudioFile(localUrl);
            
            // Set title and artist from filename
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            const [artistName, songTitle] = fileName.split(' - ');
            setTitle(songTitle || fileName);
            setArtist(artistName || '');
            
        } catch (err) {
            console.error('File processing error:', err);
            setCoverImage(null);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration || 0);
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleTimeChange = useCallback((e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        audioRef.current.currentTime = time;
    }, []);

    const togglePlayPause = useCallback(() => {
        if (audioRef.current.paused) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
        setIsPlaying(prev => !prev);
    }, []);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const cleanupUrls = useCallback(() => {
        if (audioFile) URL.revokeObjectURL(audioFile);
        if (coverImage && coverImage.startsWith('blob:')) {
            URL.revokeObjectURL(coverImage);
        }
    }, [audioFile, coverImage]);

    useEffect(() => {
        const audio = audioRef.current;
        return () => {
            if (audio) {
                audio.pause();
                audio.src = '';
            }
            cleanupUrls();
        };
    }, [audioFile, cleanupUrls]);

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 relative">
            <h1 className="text-3xl font-bold text-center mb-8">Audio Player</h1>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="audioFile">
                        Select Audio File
                    </label>
                    <input
                        type="file"
                        id="audioFile"
                        accept="audio/*"
                        onChange={handleFileSelect}
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                {audioFile && (
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="mb-6 flex justify-center">
                            {coverImage ? (
                                <img 
                                    src={coverImage} 
                                    alt="Song cover" 
                                    className="w-64 h-64 object-cover rounded-lg shadow-md"
                                />
                            ) : (
                                <div className="w-64 h-64 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                                    <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        
                        <audio
                            ref={audioRef}
                            src={audioFile}
                            onLoadedMetadata={handleLoadedMetadata}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => setIsPlaying(false)}
                            className="hidden"
                        />
                        
                        <AudioControls 
                            isPlaying={isPlaying}
                            onPlayPause={togglePlayPause}
                        />

                        <ProgressBar 
                            currentTime={currentTime}
                            duration={duration}
                            onTimeChange={handleTimeChange}
                        />
                    </div>
                )}
            </div>
            {isProcessing && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            )}
        </div>
    );
});

export default AudioPlayer;
