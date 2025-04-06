import React from 'react';
import { useAudio } from '../context/AudioContext';

const Queue = () => {
  const { queue, shuffledQueue, removeFromQueue, currentTrack, shuffle } = useAudio();

  return (
    <div className="fixed right-0 top-16 bottom-24 w-80 bg-[#282828] text-white p-4 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">Queue</h3>
      <div className="space-y-2">
        {currentTrack && (
          <div className="border-b border-gray-700 pb-2 mb-2">
            <p className="text-sm text-gray-400">Now Playing</p>
            <div className="flex items-center gap-3">
              <img src={currentTrack.coverUrl} alt="" className="w-10 h-10 rounded" />
              <div>
                <p className="font-medium">{currentTrack.title}</p>
                <p className="text-sm text-gray-400">{currentTrack.artist}</p>
              </div>
            </div>
          </div>
        )}
        
        {queue.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Next in Queue</p>
            {queue.map((song, index) => (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <img src={song.coverUrl} alt="" className="w-10 h-10 rounded" />
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromQueue(index)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {shuffle && shuffledQueue.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Upcoming in Shuffle</p>
            {shuffledQueue.slice(0, 5).map((song, index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <img src={song.coverUrl} alt="" className="w-10 h-10 rounded" />
                <div>
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                </div>
              </div>
            ))}
            {shuffledQueue.length > 5 && (
              <p className="text-sm text-gray-400 mt-2">
                +{shuffledQueue.length - 5} more songs
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;
