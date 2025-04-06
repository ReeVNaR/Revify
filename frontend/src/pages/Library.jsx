import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';

const Library = () => {
    const { 
        songs, 
        liked, 
        user, 
        play, 
        pause,
        currentTrack,
        isPlaying,
        playlists, 
        createPlaylist: handleCreatePlaylist,
        isPlaylistLoading
    } = useAudio();
    const [showModal, setShowModal] = useState(false);
    const [playlistName, setPlaylistName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="p-6 text-center text-white">
                <h2 className="text-2xl font-bold mb-4">Login Required</h2>
                <p className="mb-4">Please login to view your library</p>
                <button
                    onClick={() => navigate('/profile')}
                    className="px-6 py-2 bg-green-500 rounded-full hover:bg-green-600"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    const likedSongs = songs.filter(song => liked.has(song._id));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const playlist = await handleCreatePlaylist(playlistName.trim());
            if (playlist) {
                setPlaylistName('');
                setShowModal(false);
                navigate(`/playlist/${playlist._id}`);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // Show loading state while playlists are loading
    if (isPlaylistLoading) {
        return (
            <div className="p-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Your Library</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-green-500 rounded-full hover:bg-green-600"
                >
                    Create Playlist
                </button>
            </div>

            {/* Playlists Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {playlists?.map(playlist => {
                    // Ensure we get populated song data
                    const songList = playlist.songs?.filter(song => song && song.coverUrl) || [];
                    const coverImage = songList[0]?.coverUrl;
                    
                    return (
                        <div
                            key={playlist._id}
                            onClick={() => navigate(`/playlist/${playlist._id}`)}
                            className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group cursor-pointer"
                        >
                            <div className="relative mb-4">
                                <div className="aspect-square bg-[#282828] rounded-md shadow-lg overflow-hidden">
                                    {coverImage ? (
                                        <img 
                                            src={coverImage}
                                            alt={playlist.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (songList.length > 0) {
                                            currentTrack?._id === songList[0]._id && isPlaying ? pause() : play(songList[0]);
                                        }
                                    }}
                                    className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full shadow-xl flex items-center justify-center opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                                >
                                    <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                                        <path d={currentTrack?._id === songList[0]?._id && isPlaying ? "M6 4h4v16H6V4zm8 0h4v16h-4V4z" : "M8 5v14l11-7z"}/>
                                    </svg>
                                </button>
                            </div>
                            <h3 className="font-bold text-white mb-1 truncate">{playlist.name}</h3>
                            <p className="text-sm text-gray-500 truncate">By {user.username}</p>
                            <p className="text-sm text-gray-400">{songList.length} songs</p>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-[#282828] p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Create Playlist</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                                placeholder="Playlist name"
                                className="w-full px-4 py-2 bg-[#181818] rounded-md mb-4"
                                autoFocus
                            />
                            {error && <p className="text-red-500 mb-4">{error}</p>}
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-[#181818] rounded-full"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 rounded-full hover:bg-green-600"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Liked Songs Section */}
            <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">Liked Songs</h2>
                <div className="bg-[#181818] rounded-lg">
                    {likedSongs.length > 0 ? (
                        likedSongs.map((song) => (
                            <div
                                key={song._id}
                                className="flex items-center px-4 py-3 hover:bg-[#282828] group cursor-pointer"
                                onClick={() => navigate(`/songs/${song._id}`)}
                            >
                                <img
                                    src={song.coverUrl}
                                    alt={song.title}
                                    className="w-12 h-12 rounded mr-4"
                                />
                                <div className="flex-grow">
                                    <p className="font-medium">{song.title}</p>
                                    <p className="text-sm text-gray-400">{song.artist}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        currentTrack?._id === song._id && isPlaying ? pause() : play(song);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-2"
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
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-400">
                            No liked songs yet
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Library;
