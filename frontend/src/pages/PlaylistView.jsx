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
    const playlist = user?.playlists?.find(p => p._id === playlistId);

    // Update effect to load and sync playlist songs
    useEffect(() => {
        if (!playlist) return;
        
        const loadPlaylistSongs = () => {
            if (playlist.songs && Array.isArray(playlist.songs)) {
                setPlaylistSongs(playlist.songs);
            }
        };

        loadPlaylistSongs();
    }, [playlist]);

    const availableSongs = songs.filter(song => 
        !playlistSongs.some(ps => ps._id === song._id)
    );

    if (!user) return <LoadingSpinner />;
    if (!playlist) return <div className="p-6 text-white">Playlist not found</div>;

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
            const updatedPlaylist = await addSongToPlaylist(playlistId, songId);
            if (updatedPlaylist) {
                setPlaylistSongs(updatedPlaylist.songs);
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
            const updatedPlaylist = await removeSongFromPlaylist(playlistId, songId);
            if (updatedPlaylist) {
                setPlaylistSongs(updatedPlaylist.songs);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSongMenu = (e, songId) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === songId ? null : songId);
    };

    return (
        <div className="p-4 md:p-6 text-white">
            {error && (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}
            <div className="bg-gradient-to-b from-[#535353] to-[#121212] rounded-lg p-4 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <div className="w-32 h-32 md:w-48 md:h-48 bg-[#282828] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {playlistSongs.length > 0 ? (
                            playlistSongs.length === 1 ? (
                                <img 
                                    src={playlistSongs[0].coverUrl} 
                                    alt="Cover" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="grid grid-cols-2 w-full h-full">
                                    {playlistSongs.slice(0, 4).map((song, idx) => (
                                        <img 
                                            key={`${song._id}-${idx}`}
                                            src={song.coverUrl} 
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                            <svg className="w-16 h-16 md:w-24 md:h-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                            </svg>
                        )}
                    </div>
                    <div className="flex-grow">
                        {isEditing ? (
                            <form onSubmit={handleNameUpdate} className="w-full">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-[#282828] px-4 py-2 rounded-md"
                                    placeholder="Playlist name"
                                    autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                    <button 
                                        type="submit" 
                                        className="px-4 py-2 bg-green-500 rounded-full text-sm md:text-base disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsEditing(false); setError(''); }} 
                                        className="px-4 py-2 bg-[#282828] rounded-full text-sm md:text-base"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h1 className="text-2xl md:text-4xl font-bold break-words">{playlist.name}</h1>
                                <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">{playlistSongs.length} songs</p>
                                <div className="flex flex-wrap gap-2 md:gap-4 mt-3 md:mt-4">
                                    <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 rounded-full text-sm md:text-base">Edit Name</button>
                                    <button onClick={() => setShowAddSongs(true)} className="px-3 py-1.5 md:px-4 md:py-2 bg-green-500 rounded-full text-sm md:text-base">Add Songs</button>
                                    <button onClick={handleDelete} className="px-3 py-1.5 md:px-4 md:py-2 bg-red-500 rounded-full text-sm md:text-base">Delete Playlist</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Songs List */}
            <div className="bg-[#181818] rounded-lg">
                {playlistSongs.map(song => (
                    <div key={song._id} className="flex items-center px-3 md:px-4 py-2 md:py-3 hover:bg-[#282828] group relative">
                        <img src={song.coverUrl} alt={song.title} className="w-10 h-10 md:w-12 md:h-12 rounded mr-3 md:mr-4"/>
                        <div className="flex-grow min-w-0">
                            <p className="font-medium text-sm md:text-base truncate">{song.title}</p>
                            <p className="text-xs md:text-sm text-gray-400 truncate">{song.artist}</p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <button
                                onClick={() => currentTrack?._id === song._id && isPlaying ? pause() : play(song)}
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
                            >
                                {currentTrack?._id === song._id && isPlaying ? (
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={(e) => handleSongMenu(e, song._id)}
                                className="p-1.5 md:p-2 hover:bg-[#383838] rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#282828] p-4 md:p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg md:text-xl font-bold mb-4">Add Songs</h3>
                        <div className="space-y-2">
                            {availableSongs.map(song => (
                                <div key={song._id} className="flex items-center gap-3 p-2 hover:bg-[#383838] rounded-lg">
                                    <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded"/>
                                    <div className="flex-grow min-w-0">
                                        <p className="font-medium text-sm md:text-base truncate">{song.title}</p>
                                        <p className="text-xs md:text-sm text-gray-400 truncate">{song.artist}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddSong(song._id)}
                                        className="p-2 bg-green-500 rounded-full flex-shrink-0"
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
                            className="w-full mt-4 py-2 bg-white/10 rounded-full text-sm md:text-base"
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
