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
    const [isExpanded, setIsExpanded] = useState(false);

    const recentlyAddedSongs = useMemo(() => {
        return [...songs]
            .sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            })
            .slice(0, isExpanded ? 14 : 4);  // Show 14 songs when expanded, 4 when collapsed
    }, [songs, sortOrder, isExpanded]);

    const handlePlayPause = (song, e) => {
        e.preventDefault();
        if (currentTrack?.audioUrl === song.audioUrl && isPlaying) {
            pause();
        } else {
            play(song);
        }
    };

    return (
        <div className="p-2 pb-20 md:pb-2 text-white overflow-x-hidden">
            <div className="mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-2 bg-[#282828] rounded-lg text-white focus:outline-none text-sm"
                />
            </div>

            {!searchQuery && (
                <>
                    {recentlyPlayed.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-lg font-bold mb-2">Recently Played</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                                {recentlyPlayed.slice(0, 4).map(song => (
                                    <div 
                                        key={song._id}
                                        className="bg-[#181818] p-2 rounded-lg hover:bg-[#282828] transition-all duration-300 group relative cursor-pointer"
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

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-bold">Recently Added</h2>
                            <button
                                onClick={() => setIsExpanded(prev => !prev)}
                                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                            >
                                {isExpanded ? 'Show Less' : 'Show All'}
                            </button>
                        </div>
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 ${isExpanded ? 'grid-rows-4' : 'grid-rows-1'}`}>
                            {recentlyAddedSongs.map(song => (
                                <div 
                                    key={song._id}
                                    className="bg-[#181818] p-2 rounded-lg hover:bg-[#282828] transition-all duration-300 group relative cursor-pointer"
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
                    <h2 className="text-lg font-bold mb-2">Search Results</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                        {searchResults.slice(0, 4).map(song => (
                            <div 
                                key={song._id}
                                className="bg-[#181818] p-2 rounded-lg hover:bg-[#282828] transition-all duration-300 group relative cursor-pointer"
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
