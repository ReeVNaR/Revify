import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PlaylistView = () => {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const { user, songs, currentTrack, isPlaying, play, pause, 
            deletePlaylist, updatePlaylistName, addSongToPlaylist, 
            removeSongFromPlaylist, addToQueue } = useAudio();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [showAddSongs, setShowAddSongs] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [songToRemove, setSongToRemove] = useState(null);
    const [playlistSongs, setPlaylistSongs] = useState([]);

    // Find playlist first
    const playlist = user?.playlists?.find(p => p._id === playlistId) || { songs: [] };

    // Add effect to load and sync playlist songs
    useEffect(() => {
        if (playlist?.songs && songs.length > 0) {
            const currentPlaylistSongs = songs.filter(song => 
                playlist.songs.includes(song._id)
            );
            setPlaylistSongs(currentPlaylistSongs);
        }
    }, [playlist?.songs, songs]);

    const availableSongs = songs.filter(song => 
        !playlist?.songs?.includes(song._id)
    );

    if (!user) return <LoadingSpinner />;
    if (!playlist) return <LoadingSpinner />;

    const handleNameUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (!newName.trim()) throw new Error('Name cannot be empty');
            await updatePlaylistName(playlistId, newName.trim());
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this playlist?')) {
            await deletePlaylist(playlistId);
            navigate('/library');
        }
    };

    // Update handleAddSong
    const handleAddSong = async (songId) => {
        try {
            await addSongToPlaylist(playlistId, songId);
            const songToAdd = songs.find(s => s._id === songId);
            if (songToAdd) {
                setPlaylistSongs(prev => [...prev, songToAdd]);
            }
            setShowAddSongs(false);
        } catch (err) {
            setError(err.message);
        }
    };

    // Update handleRemoveSong
    const handleRemoveSong = async (songId) => {
        setSongToRemove(null);
        try {
            await removeSongFromPlaylist(playlistId, songId);
            setPlaylistSongs(prev => 
                prev.filter(song => song._id !== songId)
            );
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSongMenu = (e, songId) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === songId ? null : songId);
    };

    return (
        <div className="p-6 text-white">
            {error && (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}
            <div className="bg-gradient-to-b from-[#535353] to-[#121212] rounded-lg p-8 mb-8">
                <div className="flex items-center gap-6">
                    <div className="w-48 h-48 bg-[#282828] rounded-lg flex items-center justify-center">
                        <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                    </div>
                    <div className="flex-grow">
                        {isEditing ? (
                            <form onSubmit={handleNameUpdate}>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="bg-[#282828] px-4 py-2 rounded-md"
                                    placeholder="Playlist name"
                                    autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                    <button 
                                        type="submit" 
                                        className="px-4 py-2 bg-green-500 rounded-full disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-[#282828] rounded-full">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h1 className="text-4xl font-bold">{playlist.name}</h1>
                                <p className="text-gray-400 mt-2">{playlistSongs.length} songs</p>
                                <div className="flex gap-4 mt-4">
                                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white/10 rounded-full">Edit Name</button>
                                    <button onClick={() => setShowAddSongs(true)} className="px-4 py-2 bg-green-500 rounded-full">Add Songs</button>
                                    <button onClick={handleDelete} className="px-4 py-2 bg-red-500 rounded-full">Delete Playlist</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Songs List */}
            <div className="bg-[#181818] rounded-lg">
                {playlistSongs.map(song => (
                    <div key={song._id} className="flex items-center px-4 py-3 hover:bg-[#282828] group relative">
                        <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded mr-4"/>
                        <div className="flex-grow">
                            <p className="font-medium">{song.title}</p>
                            <p className="text-sm text-gray-400">{song.artist}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => currentTrack?._id === song._id && isPlaying ? pause() : play(song)}
                                className="opacity-0 group-hover:opacity-100"
                            >
                                {currentTrack?._id === song._id && isPlaying ? (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={(e) => handleSongMenu(e, song._id)}
                                className="p-2 hover:bg-[#383838] rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                            </button>
                            {activeMenu === song._id && (
                                <div 
                                    className="absolute right-0 top-full mt-2 w-48 bg-[#282828] rounded-md shadow-lg z-50"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                addToQueue(song);
                                                setActiveMenu(null);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-[#383838] text-sm"
                                        >
                                            Add to Queue
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSongToRemove(song._id);
                                                setActiveMenu(null);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-[#383838] text-sm text-red-500"
                                        >
                                            Remove from Playlist
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Songs Modal */}
            {showAddSongs && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-[#282828] p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Add Songs</h3>
                        <div className="space-y-2">
                            {availableSongs.map(song => (
                                <div key={song._id} className="flex items-center gap-4 p-2 hover:bg-[#383838] rounded-lg">
                                    <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded"/>
                                    <div className="flex-grow">
                                        <p className="font-medium">{song.title}</p>
                                        <p className="text-sm text-gray-400">{song.artist}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddSong(song._id)}
                                        className="p-2 bg-green-500 rounded-full"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowAddSongs(false)}
                            className="w-full mt-4 py-2 bg-white/10 rounded-full"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Remove Song Confirmation Modal */}
            {songToRemove && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#282828] p-6 rounded-lg w-96">
                        <h3 className="text-xl font-bold mb-4">Remove Song</h3>
                        <p className="mb-6">Are you sure you want to remove this song from the playlist?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setSongToRemove(null)}
                                className="px-4 py-2 bg-[#181818] rounded-full"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRemoveSong(songToRemove)}
                                className="px-4 py-2 bg-red-500 rounded-full"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaylistView;
