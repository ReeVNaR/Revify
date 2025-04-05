import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { fetchSongs } from '../services/api';

const AudioContext = createContext();

const AudioProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [songs, setSongs] = useState([]);
    const [volume, setVolume] = useState(1);
    const [queue, setQueue] = useState([]);
    const [liked, setLiked] = useState(new Set());
    const [repeat, setRepeat] = useState('off'); // off, one, all
    const [shuffle, setShuffle] = useState(false);
    const [playbackHistory, setPlaybackHistory] = useState([]);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = volume;

        if (currentTrack) {
            audio.src = currentTrack.audioUrl;
            if (isPlaying) audio.play();
        }

        const handleEnded = () => {
            setIsPlaying(false);
            playNext();
        };

        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.pause();
            audio.src = '';
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentTrack, volume]);

    // Add songs loading on mount
    useEffect(() => {
        const loadSongs = async () => {
            try {
                const data = await fetchSongs();
                setSongs(data);
            } catch (err) {
                console.error('Failed to load songs:', err);
            }
        };
        loadSongs();
    }, []);

    const addToHistory = useCallback((song) => {
        setPlaybackHistory(prev => {
            const newHistory = prev.filter(s => s._id !== song._id);
            return [song, ...newHistory].slice(0, 50);
        });
    }, []);

    // Fix play function
    const play = useCallback((track) => {
        if (!track) return;

        if (currentTrack?._id === track._id) {
            audioRef.current.play();
            setIsPlaying(true);
        } else {
            setCurrentTrack(track);
            audioRef.current.src = track.audioUrl;
            audioRef.current.play().catch(console.error);
            setIsPlaying(true);
            addToHistory(track);
        }
    }, [currentTrack, addToHistory]);

    const pause = useCallback(() => {
        audioRef.current.pause();
        setIsPlaying(false);
    }, []);

    const findRandomSong = (currentSong) => {
        const availableSongs = songs.filter(song => song._id !== currentSong._id);
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        return availableSongs[randomIndex];
    };

    const playNext = useCallback(() => {
        if (!currentTrack || songs.length === 0) return;
        
        // First check queue
        if (queue.length > 0) {
            const nextSong = queue[0];
            setQueue(prev => prev.slice(1)); // Remove the played song from queue
            play(nextSong);
            return;
        }

        // Handle shuffle mode
        if (shuffle) {
            const availableSongs = songs.filter(song => song._id !== currentTrack._id);
            const randomSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
            play(randomSong);
            return;
        }

        // Normal sequential play
        const currentIndex = songs.findIndex(song => song._id === currentTrack._id);
        const nextIndex = (currentIndex + 1) % songs.length;
        play(songs[nextIndex]);
    }, [currentTrack, songs, queue, shuffle, play]);

    const playPrevious = useCallback(() => {
        if (!currentTrack || songs.length === 0) return;
        
        const currentIndex = songs.findIndex(song => song._id === currentTrack._id);
        
        // Handle shuffle mode
        if (shuffle) {
            const availableSongs = songs.filter(song => song._id !== currentTrack._id);
            const randomSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
            play(randomSong);
            return;
        }

        // Normal sequential play
        const previousIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
        play(songs[previousIndex]);
    }, [currentTrack, songs, shuffle, play]);

    const toggleLike = (songId) => {
        setLiked(prev => {
            const newLiked = new Set(prev);
            if (newLiked.has(songId)) {
                newLiked.delete(songId);
            } else {
                newLiked.add(songId);
            }
            return newLiked;
        });
    };

    const addToQueue = (song) => {
        setQueue(prev => [...prev, song]);
    };

    const removeFromQueue = (index) => {
        setQueue(prev => prev.filter((_, i) => i !== index));
    };

    const toggleRepeat = () => {
        setRepeat(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
    };

    const toggleShuffle = () => {
        setShuffle(prev => !prev);
    };

    const getNextSong = () => {
        if (queue.length) return queue[0];
        if (shuffle) {
            return songs[Math.floor(Math.random() * songs.length)];
        }
        const currentIndex = songs.findIndex(s => s._id === currentTrack?._id);
        return songs[(currentIndex + 1) % songs.length];
    };

    const getPreviousSong = () => {
        const currentIndex = songs.findIndex(s => s._id === currentTrack?._id);
        return songs[currentIndex === 0 ? songs.length - 1 : currentIndex - 1];
    };

    return (
        <AudioContext.Provider value={{ currentTrack, isPlaying, play, pause, audioRef, playNext, playPrevious, songs, setSongs, volume, setVolume, queue, liked, repeat, shuffle, toggleLike, addToQueue, removeFromQueue, toggleRepeat, toggleShuffle, playbackHistory, addToHistory }}>
            {children}
        </AudioContext.Provider>
    );
}

const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};

// Remove duplicate export and use a single export statement
export { AudioContext, AudioProvider, useAudio };
