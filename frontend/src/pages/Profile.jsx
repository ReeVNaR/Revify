import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
    const navigate = useNavigate();
    const { liked, user, login, register, logout } = useAudio();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false); // Add this state

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { username, password } = formData;
            if (username.trim().length < 3) {
                throw new Error('Username must be at least 3 characters');
            }
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            if (isLogin) {
                await login(username, password);
            } else {
                await register(username, password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async () => {
        setIsEditing(true);
    };

    if (!user) {
        return (
            <div className="p-4 md:p-6 text-white">
                <div className="max-w-2xl mx-auto bg-[#282828] rounded-lg p-4 md:p-8">
                    <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                        {isLogin ? 'Login to Your Account' : 'Create Account'}
                    </h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                className="w-full px-4 py-2 bg-[#181818] rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full px-4 py-2 bg-[#181818] rounded-md"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500">{error}</p>}

                        <button
                            type="submit"
                            className="w-full py-3 bg-green-500 hover:bg-green-600 rounded-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
                        </button>

                        <p className="text-center">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-green-500 hover:underline"
                            >
                                {isLogin ? 'Sign Up' : 'Login'}
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        );
    }

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    if (user?.loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <div className="p-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-[#282828] rounded-full transition-colors"
                    aria-label="Go back"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                </button>
            </div>
            <div className="bg-gradient-to-b from-[#404040] to-[#121212] px-4 md:px-6 pt-16 pb-8">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 max-w-7xl mx-auto">
                    <div className="w-44 h-44 md:w-52 md:h-52 rounded-full shadow-2xl bg-[#282828] flex items-center justify-center">
                        <span className="text-6xl md:text-7xl font-bold text-white">
                            {getInitial(user.username)}
                        </span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-sm font-bold uppercase">Profile</p>
                        <h1 className="text-5xl md:text-7xl font-extrabold mt-2">{user.username}</h1>
                        <div className="mt-6 flex flex-col md:flex-row items-center gap-4">
                            <div className="text-sm text-gray-300">
                                <span className="font-bold text-white">{liked.size}</span> Liked Songs • 
                                <span className="font-bold text-white ml-1">{user.playlists?.length || 0}</span> Playlists
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEdit}
                                    className="px-8 py-2 text-sm font-bold bg-white text-black rounded-full hover:scale-105 transition-transform"
                                >
                                    Edit profile
                                </button>
                                <button
                                    onClick={logout}
                                    className="px-8 py-2 text-sm font-bold border border-white/20 rounded-full hover:border-white transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-6">
                <div className="bg-[#181818] p-6 rounded-lg hover:bg-[#282828] transition-colors">
                    <h2 className="text-xl font-bold mb-6">Account Overview</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Username</p>
                            <p className="font-medium text-lg">{user.username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Member Since</p>
                            <p className="font-medium text-lg">
                                {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#181818] p-6 rounded-lg hover:bg-[#282828] transition-colors">
                    <h2 className="text-xl font-bold mb-6">Your Library Stats</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-3xl md:text-4xl font-bold">{liked.size}</p>
                            <p className="text-sm text-gray-400 mt-1">Liked Songs</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-4xl font-bold">{user.playlists?.length || 0}</p>
                            <p className="text-sm text-gray-400 mt-1">Playlists</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
