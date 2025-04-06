import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { fetchSongs, createUser, loginUser, getUser, toggleLikeSong, createPlaylist as apiCreatePlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist, updatePlaylistName as apiUpdatePlaylistName } from '../services/api';

const AudioContext = createContext();

const AudioProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [songs, setSongs] = useState([]);
    const [volume, setVolume] = useState(1);
    const [queue, setQueue] = useState([]);
    const [repeat, setRepeat] = useState('off'); // off, one, all
    const [shuffle, setShuffle] = useState(false);
    const [playbackHistory, setPlaybackHistory] = useState([]);
    const audioRef = useRef(new Audio());
    const [playlists, setPlaylists] = useState([]);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [shuffledQueue, setShuffledQueue] = useState([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [liked, setLiked] = useState(() => {
        const savedLikes = localStorage.getItem('likedSongs');
        return new Set(savedLikes ? JSON.parse(savedLikes) : []);
    });

    // Add loading states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaylistLoading, setIsPlaylistLoading] = useState(true);

    // Save liked songs whenever they change
    useEffect(() => {
        if (liked.size > 0) {
            localStorage.setItem('likedSongs', JSON.stringify([...liked]));
        }
    }, [liked]);

    const login = async (username, password) => {
        try {
            const userData = await loginUser({ username, password });
            if (!userData) throw new Error('Login failed');
            
            setUser(userData);
            setLiked(new Set(userData.likedSongs?.map(song => song._id) || []));
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('likedSongs', JSON.stringify([...userData.likedSongs.map(song => song._id)]));
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (username, password) => {
        try {
            const userData = await createUser({ username, password });
            if (!userData) throw new Error('Registration failed');
            
            setUser(userData);
            setLiked(new Set());
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setLiked(new Set());
        localStorage.removeItem('user');
        localStorage.removeItem('likedSongs');
    };

    const addToHistory = useCallback((song) => {
        setPlaybackHistory(prev => {
            const newHistory = prev.filter(s => s._id !== song._id);
            return [song, ...newHistory].slice(0, 50);
        });
        setRecentlyPlayed(prev => {
            const newRecent = [song, ...prev.filter(s => s._id !== song._id)].slice(0, 6);
            return newRecent;
        });
    }, []);

    // Add error handling for audio
    const handleAudioError = useCallback((e) => {
        console.error('Audio error:', e);
        const errorMessage = e.target.error?.message || 'Failed to play audio';
        setError(errorMessage);
        setIsPlaying(false);
        
        // Reset audio element
        const audio = audioRef.current;
        audio.pause();
        audio.currentTime = 0;
    }, []);

    // Update initializeAudio
    const initializeAudio = useCallback(() => {
        const audio = audioRef.current;
        audio.volume = volume;
        
        const handleLoadStart = () => {
            // Reset error state on new load
            setError(null);
        };

        audio.addEventListener('error', handleAudioError);
        audio.addEventListener('loadstart', handleLoadStart);
        
        return () => {
            audio.removeEventListener('error', handleAudioError);
            audio.removeEventListener('loadstart', handleLoadStart);
        };
    }, [volume, handleAudioError]);

    // Update play function with better state management
    const play = useCallback(async (track) => {
        if (!track?.audioUrl) {
            setError('Invalid audio track');
            return;
        }

        try {
            const audio = audioRef.current;
            
            if (currentTrack?._id === track._id) {
                await audio.play();
                setIsPlaying(true);
                return;
            }

            // Stop current playback before switching tracks
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
            
            setCurrentTrack(track);
            audio.src = track.audioUrl;
            await audio.play();
            setIsPlaying(true);
            addToHistory(track);
        } catch (error) {
            console.error('Playback error:', error);
            setError('Failed to play track');
            setIsPlaying(false);
        }
    }, [currentTrack, addToHistory]);

    // Update pause function
    const pause = useCallback(() => {
        const audio = audioRef.current;
        audio.pause();
        setIsPlaying(false);
    }, []);

    const shuffleAllSongs = useCallback(() => {
        const shuffled = [...songs]
            .filter(song => song._id !== currentTrack?._id)
            .sort(() => Math.random() - 0.5);
        setShuffledQueue(shuffled);
        setShuffle(true);
        if (shuffled.length > 0) {
            play(shuffled[0]);
        }
    }, [songs, currentTrack, play]);

    const playNext = useCallback(() => {
        if (!currentTrack || songs.length === 0) return;
        
        // First check manual queue
        if (queue.length > 0) {
            const nextSong = queue[0];
            setQueue(prev => prev.slice(1));
            play(nextSong);
            return;
        }

        // Then check shuffled queue
        if (shuffle && shuffledQueue.length > 0) {
            const nextSong = shuffledQueue[0];
            setShuffledQueue(prev => prev.slice(1));
            play(nextSong);
            return;
        }

        // Normal sequential play
        const currentIndex = songs.findIndex(song => song._id === currentTrack._id);
        const nextIndex = (currentIndex + 1) % songs.length;
        play(songs[nextIndex]);
    }, [currentTrack, songs, queue, shuffle, shuffledQueue, play]);

    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = volume;

        const handleEnded = () => {
            playNext();
        };

        if (currentTrack) {
            audio.src = currentTrack.audioUrl;
            audio.play()
                .catch(error => console.error('Auto-play failed:', error));
        }

        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.pause();
            audio.src = '';
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentTrack, volume, playNext]);

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

    const toggleLike = async (songId) => {
        if (!user) return;

        try {
            // Optimistic update
            const isLiking = !liked.has(songId);
            setLiked(prev => {
                const newLiked = new Set(prev);
                if (isLiking) {
                    newLiked.add(songId);
                } else {
                    newLiked.delete(songId);
                }
                return newLiked;
            });

            // Update database and get fresh user data
            const updatedUser = await toggleLikeSong(user.username, songId, isLiking);
            
            // Update state with server data
            setUser(updatedUser);
            setLiked(new Set(updatedUser.likedSongs.map(song => song._id)));
            localStorage.setItem('user', JSON.stringify(updatedUser));
            localStorage.setItem('likedSongs', JSON.stringify(updatedUser.likedSongs.map(song => song._id)));
        } catch (error) {
            console.error('Failed to toggle like:', error);
            // Revert on error
            setLiked(prev => {
                const newLiked = new Set(prev);
                if (newLiked.has(songId)) {
                    newLiked.delete(songId);
                } else {
                    newLiked.add(songId);
                }
                return newLiked;
            });
        }
    };

    // Add real-time liked songs sync
    useEffect(() => {
        if (user?.username) {
            const syncLikedSongs = async () => {
                try {
                    const userData = await getUser(user.username);
                    if (userData) {
                        const userLikes = new Set(userData.likedSongs.map(song => song._id));
                        setLiked(userLikes);
                        localStorage.setItem('likedSongs', JSON.stringify([...userLikes]));
                    }
                } catch (error) {
                    console.error('Failed to sync liked songs:', error);
                }
            };

            // Sync every 30 seconds
            const interval = setInterval(syncLikedSongs, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Optimize queue management
    const addToQueue = useCallback((song) => {
        if (!song) return;
        setQueue(prev => {
            // Prevent duplicate songs in queue
            if (prev.some(s => s._id === song._id)) return prev;
            return [...prev, song];
        });
    }, []);

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

    // Optimize user data loading
    useEffect(() => {
        const loadData = async () => {
            if (!user?.username) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const [userData, songsData] = await Promise.all([
                    getUser(user.username),
                    fetchSongs()
                ]);

                // Batch updates
                setUser(userData);
                setSongs(songsData);
                setLiked(new Set(userData.likedSongs?.map(song => song._id) || []));
                setPlaylists(userData.playlists || []);
            } catch (error) {
                setError('Failed to load data');
                console.error('Load error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user?.username]);

    // Initialize audio
    useEffect(() => {
        const cleanup = initializeAudio();
        return () => {
            cleanup();
            audioRef.current.pause();
            audioRef.current.src = '';
        };
    }, [initializeAudio]);

    // Update loadUserData with better playlist handling
    useEffect(() => {
        const loadUserData = async () => {
            if (!user?.username) {
                setIsLoading(false);
                return;
            }

            try {
                setIsPlaylistLoading(true);
                const userData = await getUser(user.username);
                
                // Update playlists with full song data
                const updatedPlaylists = userData.playlists.map(playlist => ({
                    ...playlist,
                    songs: songs.filter(song => playlist.songs.includes(song._id))
                }));

                setUser(userData);
                setPlaylists(updatedPlaylists);
                setLiked(new Set(userData.likedSongs?.map(song => song._id) || []));
            } catch (error) {
                console.error('Failed to load user data:', error);
            } finally {
                setIsPlaylistLoading(false);
            }
        };

        loadUserData();
    }, [user?.username, songs]);

    // Optimize playlist operations
    const handlePlaylistOperations = {
        create: async (name) => {
            if (!user) return;
            setIsPlaylistLoading(true);
            try {
                const updatedUser = await apiCreatePlaylist(user.username, name);
                setUser(updatedUser);
                setPlaylists(updatedUser.playlists || []);
                return updatedUser;
            } catch (error) {
                console.error('Failed to create playlist:', error);
                throw error;
            } finally {
                setIsPlaylistLoading(false);
            }
        },

        delete: async (playlistId) => {
            if (!user) return;
            try {
                const updatedUser = await deletePlaylist(user.username, playlistId);
                setUser(updatedUser);
                return updatedUser;
            } catch (error) {
                console.error('Failed to delete playlist:', error);
                throw error;
            }
        },

        updateName: async (playlistId, name) => {
            if (!user) return;
            try {
                const updatedUser = await updatePlaylistName(user.username, playlistId, name);
                setUser(updatedUser);
                return updatedUser;
            } catch (error) {
                console.error('Failed to update playlist name:', error);
                throw error;
            }
        },

        addSong: async (playlistId, songId) => {
            if (!user || !playlistId || !songId) return;
            setIsPlaylistLoading(true);
            try {
                const updatedUser = await addSongToPlaylist(user.username, playlistId, songId);
                const updatedPlaylists = updatedUser.playlists.map(playlist => ({
                    ...playlist,
                    songs: songs.filter(song => playlist.songs.includes(song._id))
                }));
                setUser(updatedUser);
                setPlaylists(updatedPlaylists);
                return updatedUser;
            } catch (error) {
                console.error('Failed to add song to playlist:', error);
                throw error;
            } finally {
                setIsPlaylistLoading(false);
            }
        },

        removeSong: async (playlistId, songId) => {
            if (!user) return;
            try {
                const updatedUser = await removeSongFromPlaylist(user.username, playlistId, songId);
                setUser(updatedUser);
                // Update playlists state directly
                setPlaylists(updatedUser.playlists || []);
                return updatedUser;
            } catch (error) {
                console.error('Failed to remove song from playlist:', error);
                throw error;
            }
        }
    };

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        
        const results = songs.filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
    }, [songs]);

    // Add cleanup effect
    useEffect(() => {
        const audio = audioRef.current;

        const cleanup = () => {
            audio.pause();
            audio.src = '';
            audio.load();
        };

        return cleanup;
    }, []);

    // Handle audio ended event
    useEffect(() => {
        const audio = audioRef.current;
        
        const handleEnded = () => {
            setIsPlaying(false);
            playNext();
        };

        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, [playNext]);

    // Expose loading and error states
    return (
        <AudioContext.Provider value={{ 
            currentTrack, 
            isPlaying, 
            play, 
            pause, 
            audioRef, 
            playNext, 
            playPrevious, 
            songs, 
            setSongs, 
            volume, 
            setVolume, 
            queue, 
            liked, 
            repeat, 
            shuffle, 
            toggleLike, 
            addToQueue, 
            removeFromQueue, 
            toggleRepeat, 
            toggleShuffle, 
            playbackHistory, 
            addToHistory,
            user,
            login,
            register,
            logout,
            playlists,
            currentPlaylist,
            setCurrentPlaylist,
            createPlaylist: handlePlaylistOperations.create,
            deletePlaylist: handlePlaylistOperations.delete,
            updatePlaylistName: handlePlaylistOperations.updateName,
            addSongToPlaylist: handlePlaylistOperations.addSong,
            removeSongFromPlaylist: handlePlaylistOperations.removeSong,
            shuffleAllSongs,
            shuffledQueue,
            isLoading,
            error,
            clearError: () => setError(null),
            recentlyPlayed,
            searchQuery,
            searchResults,
            handleSearch,
            isPlaylistLoading,
        }}>
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
