import React, { useState, useCallback } from 'react';
import { parseReadableStream } from 'music-metadata-browser';
import { uploadFile, createSong } from '../services/api';

export default function SongUploader() {
  const [songs, setSongs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.includes('audio'));
    
    try {
      const songsPromises = validFiles.map(async (file) => {
        const metadata = await parseReadableStream(file.stream(), {
          fileSize: file.size,
        });

        const { title, artist, genre, picture } = metadata.common;
        const genreString = Array.isArray(genre) ? genre[0] : genre;

        return {
          file,
          info: {
            title: title || file.name.replace('.mp3', ''),
            artist: artist || 'Unknown Artist',
            genre: genreString || 'Unknown Genre',
            cover: picture && picture.length > 0 ? URL.createObjectURL(
              new Blob([picture[0].data], { type: picture[0].format })
            ) : null
          }
        };
      });

      const newSongs = await Promise.all(songsPromises);
      setSongs(prev => [...prev, ...newSongs]);
    } catch (err) {
      console.error('Error reading metadata:', err);
    }
  };

  const handleUpload = async () => {
    if (songs.length === 0) {
      alert('Please select files first!');
      return;
    }

    setIsUploading(true);
    try {
      for (const song of songs) {
        // Upload audio file
        const audioUploadResponse = await uploadFile(song.file);
        
        // Process cover image if exists
        let coverUrl = null;
        if (song.info.cover) {
          const response = await fetch(song.info.cover);
          const blob = await response.blob();
          const coverFile = new File([blob], 'cover.jpg', { type: blob.type });
          const coverUploadResponse = await uploadFile(coverFile);
          coverUrl = coverUploadResponse.url;
        }

        // Create song in database
        const songData = {
          title: song.info.title,
          artist: song.info.artist,
          genre: song.info.genre,
          audioUrl: audioUploadResponse.url,
          coverUrl: coverUrl || 'https://default-cover-url.jpg'
        };

        await createSong(songData);
      }
      
      alert(`${songs.length} songs uploaded successfully!`);
      setSongs([]);

    } catch (err) {
      console.error('Error uploading:', err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeSong = (index) => {
    setSongs(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  return (
    <div className="pb-24"> {/* Add padding bottom to prevent content overlap with fixed button */}
      <div className="p-8 max-w-xl mx-auto">
        <h2 className="text-[#1DB954] text-2xl font-bold mb-6">Upload Music</h2>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files);
          }}
          className={`
            border-2 border-dashed rounded-lg p-8 mb-6 transition-colors
            ${isDragging 
              ? 'border-[#1DB954] bg-[#1DB954]/10' 
              : 'border-[#B3B3B3] hover:border-[#1DB954]'
            }
          `}
        >
          <div className="text-center text-white">
            <p className="mb-4">Drag and drop your MP3 files here</p>
            <p className="text-[#B3B3B3]">or</p>
            <label className="inline-block mt-4 px-6 py-3 bg-[#1DB954] text-white rounded-full cursor-pointer hover:bg-[#1ed760] transition-colors">
              <span className="font-semibold">Choose Files</span>
              <input 
                type="file" 
                accept="audio/mp3" 
                onChange={(e) => handleFileSelect(e.target.files)} 
                className="hidden"
                multiple
              />
            </label>
          </div>
        </div>
        
        {songs.length > 0 && (
          <div className="space-y-4 mb-6">
            {songs.map((song, index) => (
              <div key={index} className="p-4 bg-[#191414] rounded-lg text-white flex justify-between items-start">
                <div>
                  <p className="text-lg mb-2"><span className="text-[#B3B3B3]">Title:</span> {song.info.title}</p>
                  <p className="text-lg mb-2"><span className="text-[#B3B3B3]">Artist:</span> {song.info.artist}</p>
                  <p className="text-lg mb-4"><span className="text-[#B3B3B3]">Genre:</span> {song.info.genre}</p>
                  {song.info.cover && (
                    <img
                      src={song.info.cover}
                      alt="Album Cover"
                      className="w-20 h-20 object-cover rounded-md shadow-lg"
                    />
                  )}
                </div>
                <button
                  onClick={() => removeSong(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed upload button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#191414] border-t border-[#282828]">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleUpload}
            disabled={songs.length === 0 || isUploading}
            className={`w-full px-6 py-3 rounded-full font-bold transition-colors ${
              songs.length === 0 || isUploading
                ? 'bg-[#1DB954]/50 cursor-not-allowed'
                : 'bg-[#1DB954] hover:bg-[#1ed760] cursor-pointer'
            } text-white`}
          >
            {isUploading ? 'Uploading...' : `Upload ${songs.length} Songs`}
          </button>
        </div>
      </div>
    </div>
  );
}
