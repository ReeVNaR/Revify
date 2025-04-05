import React, { useState, useEffect } from 'react';
import { uploadAudio, uploadImage } from '../services/api';
import axios from 'axios';

function UploadSong() {
    const [songData, setSongData] = useState({
        title: '',
        artist: '',
        genre: '',
        audioFile: null,
        coverFile: null,
        previewUrl: null, // Add this new state property
        coverPreviewUrl: null
    });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');

    const handleAudioChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create local preview URL
        const previewUrl = URL.createObjectURL(file);
        setSongData(prev => ({
            ...prev,
            audioFile: file,
            previewUrl
        }));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setSongData(prev => ({
                ...prev,
                coverFile: file,
                coverPreviewUrl: previewUrl
            }));
        }
    };

    // Clean up preview URLs when component unmounts
    useEffect(() => {
        return () => {
            if (songData.previewUrl) {
                URL.revokeObjectURL(songData.previewUrl);
            }
            if (songData.coverPreviewUrl) {
                URL.revokeObjectURL(songData.coverPreviewUrl);
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setError('');
        
        try {
            const audioUrl = await uploadAudio(songData.audioFile);
            const coverUrl = await uploadImage(songData.coverFile);
            
            const songPayload = {
                title: songData.title,
                artist: songData.artist,
                genre: songData.genre,
                audioUrl: audioUrl,
                coverUrl: coverUrl
            };

            await axios.post('http://localhost:5000/api/songs', songPayload);
            alert('Song uploaded successfully!');
            setSongData({
                title: '',
                artist: '',
                genre: '',
                audioFile: null,
                coverFile: null
            });
        } catch (err) {
            setError('Failed to upload song. Please try again.');
            console.error('Upload error:', err);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">Upload Song</h1>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="title">
                        Song Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        className="w-full p-2 border rounded-md"
                        value={songData.title}
                        onChange={(e) => setSongData({...songData, title: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="artist">
                        Artist
                    </label>
                    <input
                        type="text"
                        id="artist"
                        className="w-full p-2 border rounded-md"
                        value={songData.artist}
                        onChange={(e) => setSongData({...songData, artist: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="genre">
                        Genre
                    </label>
                    <input
                        type="text"
                        id="genre"
                        className="w-full p-2 border rounded-md"
                        value={songData.genre}
                        onChange={(e) => setSongData({...songData, genre: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="audioFile">
                        Audio File
                    </label>
                    <input
                        type="file"
                        id="audioFile"
                        accept="audio/*"
                        className="w-full p-2 border rounded-md"
                        onChange={handleAudioChange}
                        required
                    />
                </div>

                {songData.previewUrl && (
                    <div className="mt-4">
                        <label className="block text-gray-700 mb-2">
                            Preview
                        </label>
                        <audio 
                            controls 
                            className="w-full"
                            src={songData.previewUrl}
                        >
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}

                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="coverFile">
                        Cover Image
                    </label>
                    <input
                        type="file"
                        id="coverFile"
                        accept="image/*"
                        className="w-full p-2 border rounded-md"
                        onChange={handleCoverChange}
                        required
                    />
                    {songData.coverPreviewUrl && (
                        <div className="mt-2">
                            <img
                                src={songData.coverPreviewUrl}
                                alt="Cover preview"
                                className="w-48 h-48 object-cover rounded-md shadow-md"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isUploading}
                    className={`w-full py-2 px-4 rounded-md text-white transition-all duration-300 
                        ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isUploading ? 'Uploading...' : 'Upload Song'}
                </button>

                {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}
            </form>
        </div>
    );
}

export default UploadSong;
