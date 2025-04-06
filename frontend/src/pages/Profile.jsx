import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
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
            <div className="p-6 text-white">
                <div className="max-w-2xl mx-auto bg-[#282828] rounded-lg p-8">
                    <h1 className="text-2xl font-bold mb-6">
                        {isLogin ? 'Login to Your Account' : 'Create Account'}
                    </h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="p-6 text-white">
            <div className="bg-gradient-to-b from-[#535353] to-[#121212] rounded-lg p-8 mb-8">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-48 h-48 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">
                            {getInitial(user.username)}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-gray-300">Profile</p>
                        <h1 className="text-6xl font-bold mt-2">{user.username}</h1>
                        <p className="mt-4 text-gray-300">{liked.size} Liked Songs</p>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={handleEdit}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                Edit Username
                            </button>
                            <button
                                onClick={logout}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#181818] p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Account Overview</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-400">Username</p>
                            <p className="font-medium">{user.username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Member Since</p>
                            <p className="font-medium">
                                {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#181818] p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Your Library Stats</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-400">Liked Songs</p>
                            <p className="text-3xl font-bold">{liked.size}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Playlists</p>
                            <p className="text-3xl font-bold">{user.playlists?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
