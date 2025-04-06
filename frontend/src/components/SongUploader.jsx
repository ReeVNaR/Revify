import React, { useState } from 'react';
import { parseReadableStream } from 'music-metadata-browser';

function SongUploader({ onUpload }) {
  const [songInfo, setSongInfo] = useState({
    title: '',
    artist: '',
    cover: null,
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const metadata = await parseReadableStream(file.stream(), {
        fileSize: file.size,
      });

      const { title, artist, picture } = metadata.common;

      let coverImage = null;
      if (picture && picture.length > 0) {
        const image = picture[0];
        const base64String = btoa(
          new Uint8Array(image.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        coverImage = `data:${image.format};base64,${base64String}`;
      }

      const songMetadata = {
        title: title || 'Unknown Title',
        artist: artist || 'Unknown Artist',
        cover: coverImage,
      };

      setSongInfo(songMetadata);
      onUpload(file, songMetadata);

    } catch (err) {
      console.error('Error parsing metadata:', err);
    }
  };

  return (
    <div className="bg-[#282828] p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">Upload New Song</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-[#333333] transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-gray-400">Click or drag to upload MP3</p>
            </div>
            <input type="file" accept="audio/mp3" className="hidden" onChange={handleUpload} />
          </label>
        </div>

        {(songInfo.title || songInfo.artist || songInfo.cover) && (
          <div className="mt-4 p-4 bg-[#333333] rounded-lg">
            <div className="flex items-start gap-4">
              {songInfo.cover && (
                <img src={songInfo.cover} alt="Album Art" className="w-24 h-24 rounded-md" />
              )}
              <div className="flex-1">
                <p className="text-white"><span className="text-gray-400">Title:</span> {songInfo.title}</p>
                <p className="text-white"><span className="text-gray-400">Artist:</span> {songInfo.artist}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SongUploader;
