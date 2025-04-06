import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

const Search = () => {
    const navigate = useNavigate();
    const { 
        searchQuery, 
        searchResults, 
        handleSearch, 
        recentlyPlayed,
        play,
        pause,
        currentTrack,
        isPlaying,
        songs
    } = useAudio();

    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

    const recentlyAddedSongs = useMemo(() => {
        return [...songs]
            .sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            })
            .slice(0, 12);
    }, [songs, sortOrder]);

    const handlePlayPause = (song, e) => {
        e.preventDefault();
        if (currentTrack?.audioUrl === song.audioUrl && isPlaying) {
            pause();
        } else {
            play(song);
        }
    };

    return (
        <div className="p-6 text-white">
            <div className="mb-8">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search for songs or artists..."
                    className="w-full px-4 py-3 bg-[#282828] rounded-lg text-white focus:outline-none"
                />
            </div>

            {!searchQuery && (
                <>
                    {recentlyPlayed.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {recentlyPlayed.map(song => (
                                    <div 
                                        key={song._id}
                                        className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group relative cursor-pointer"
                                        onClick={() => navigate(`/songs/${song._id}`)}
                                    >
                                        <div className="relative mb-4 aspect-square">
                                            <img 
                                                src={song.coverUrl} 
                                                alt={song.title}
                                                className="w-full h-full object-cover rounded-md shadow-lg"
                                            />
                                            <button
                                                onClick={(e) => handlePlayPause(song, e)}
                                                className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                                            >
                                                {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
                                                    <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z"/>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <h3 className="font-semibold text-white mb-1 truncate">{song.title}</h3>
                                        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Recently Added</h2>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
                            >
                                Sort by Date
                                <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {recentlyAddedSongs.map(song => (
                                <div 
                                    key={song._id}
                                    className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group relative cursor-pointer"
                                    onClick={() => navigate(`/songs/${song._id}`)}
                                >
                                    <div className="relative mb-4 aspect-square">
                                        <img 
                                            src={song.coverUrl} 
                                            alt={song.title}
                                            className="w-full h-full object-cover rounded-md shadow-lg"
                                        />
                                        <button
                                            onClick={(e) => handlePlayPause(song, e)}
                                            className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                                        >
                                            {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
                                                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <h3 className="font-semibold text-white mb-1 truncate">{song.title}</h3>
                                    <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {searchQuery && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Search Results</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {searchResults.map(song => (
                            <div 
                                key={song._id}
                                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group relative cursor-pointer"
                                onClick={() => navigate(`/songs/${song._id}`)}
                            >
                                <div className="relative mb-4 aspect-square">
                                    <img 
                                        src={song.coverUrl} 
                                        alt={song.title}
                                        className="w-full h-full object-cover rounded-md shadow-lg"
                                    />
                                    <button
                                        onClick={(e) => handlePlayPause(song, e)}
                                        className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                                    >
                                        {currentTrack?.audioUrl === song.audioUrl && isPlaying ? (
                                            <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <h3 className="font-semibold text-white mb-1 truncate">{song.title}</h3>
                                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;
