import React from 'react';

const PlaylistCard = ({ playlist, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group cursor-pointer"
    >
      <div className="relative mb-4">
        <div className="aspect-square bg-[#282828] rounded-md shadow-lg overflow-hidden">
          <div className="grid grid-cols-2 h-full">
            {playlist.songs.slice(0, 4).map((song, index) => (
              <img 
                key={index}
                src={song.coverUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        </div>
        <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full shadow-xl flex items-center justify-center opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
      <h3 className="font-bold text-white mb-1">{playlist.name}</h3>
      <p className="text-sm text-gray-400">{playlist.songCount} songs</p>
    </div>
  );
};

export default PlaylistCard;
