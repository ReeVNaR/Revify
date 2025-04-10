require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const bcrypt = require('bcryptjs');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log('Cloudinary connected successfully');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow localhost and any subdomain/path of revifym.vercel.app
        if (
            origin === 'http://localhost:5173' ||
            origin.endsWith('revifym.vercel.app')
        ) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Add request timeout middleware
app.use((req, res, next) => {
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000);
    next();
});

// Logging middleware - add near the top after initial middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// Update Song Schema
const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    audioUrl: {
        type: String,
        required: true
    },
    coverUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Song = mongoose.model('Song', songSchema);

// Update User Schema with proper playlist management
const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true
    },
    likedSongs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    playlists: [playlistSchema],
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Update MongoDB Connection with more detailed logging
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    // Test connection by counting documents
    return Song.countDocuments();
  })
  .then(count => {
    console.log(`Database contains ${count} songs`);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Connection string:', MONGODB_URI); // be careful with logging in production
  });

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
app.get('/', (req, res) => {
    res.send('Revify API is running');
});

// Update Song routes with better error handling
app.get('/api/songs', async (req, res) => {
    try {
        console.log('Fetching songs...');
        const songs = await Song.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .exec();
        
        console.log(`Found ${songs.length} songs`);
        res.json(songs);
    } catch (err) {
        console.error('Error fetching songs:', err);
        res.status(500).json({ 
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Add new route for getting song by ID
app.get('/api/songs/:id', async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }
        res.json(song);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update file upload route with better validation
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        console.log('Upload request received:', {
            file: req.file ? 'Present' : 'Missing',
            bodyData: req.body.data ? 'Present' : 'Missing',
            contentType: req.file?.mimetype
        });

        if (!req.file && !req.body.data) {
            return res.status(400).json({ 
                message: 'No file uploaded',
                details: 'Request must include either a file or data field' 
            });
        }

        let uploadResponse;
        if (req.file) {
            // Create a Promise wrapper for upload_stream
            uploadResponse = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "auto",
                        folder: "songs",
                        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default"
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
                
                uploadStream.end(req.file.buffer);
            });
        } else {
            // Handle base64 data upload
            uploadResponse = await cloudinary.uploader.upload(req.body.data, {
                resource_type: "auto",
                folder: "songs",
                upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default"
            });
        }

        console.log('Upload successful:', {
            url: uploadResponse.secure_url,
            format: uploadResponse.format,
            size: uploadResponse.bytes
        });

        res.json({ url: uploadResponse.secure_url });
    } catch (err) {
        console.error('Server upload error:', err);
        res.status(500).json({ 
            message: 'Upload failed', 
            error: err.message,
            details: err.stack 
        });
    }
});

// Update song post route with validation
app.post('/api/songs', async (req, res) => {
    console.log('Song creation request:', req.body);

    // Validate required fields
    const requiredFields = ['title', 'artist', 'genre', 'audioUrl', 'coverUrl'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
        return res.status(400).json({
            message: 'Missing required fields',
            missingFields
        });
    }

    // Ensure genre is a string
    const genre = Array.isArray(req.body.genre) ? req.body.genre[0] : req.body.genre;

    const song = new Song({
        title: req.body.title,
        artist: req.body.artist,
        genre: genre,
        audioUrl: req.body.audioUrl,
        coverUrl: req.body.coverUrl
    });

    try {
        console.log('Attempting to save song with data:', song);
        const newSong = await song.save();
        console.log('Song saved successfully:', newSong._id);
        res.status(201).json(newSong);
    } catch (err) {
        console.error('Error saving song:', err);
        res.status(400).json({ 
            message: 'Failed to save song',
            error: err.message,
            details: err.errors 
        });
    }
});

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const filename = parts.pop().split('.')[0];
    return `songs/${filename}`;
};

// Update delete song route to handle Cloudinary deletion
app.delete('/api/songs/:id', async (req, res) => {
    try {
        // First find the song to get URLs
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }

        // Delete files from Cloudinary
        const audioPublicId = getPublicIdFromUrl(song.audioUrl);
        const coverPublicId = getPublicIdFromUrl(song.coverUrl);

        await Promise.all([
            cloudinary.uploader.destroy(audioPublicId, { resource_type: 'video' }),
            cloudinary.uploader.destroy(coverPublicId, { resource_type: 'image' })
        ]);

        // Delete song from MongoDB
        await Song.findByIdAndDelete(req.params.id);

        res.json({ message: 'Song and associated files deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: err.message });
    }
});

// User Routes
app.post('/api/users', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const user = new User({ username });
        await user.save();

        res.status(201).json(user);
    } catch (err) {
        console.error('User creation error:', err);
        res.status(500).json({ message: 'Failed to create user', error: err.message });
    }
});

app.get('/api/users/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .populate('likedSongs')
            .populate('playlists.songs');
            
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json(user);
    } catch (err) {
        console.error('User fetch error:', err);
        res.status(500).json({ message: 'Failed to fetch user data', error: err.message });
    }
});

// Add authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('Register attempt:', req.body);
        const { username, password } = req.body;

        // Basic validation
        if (!username?.trim() || !password?.trim()) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ username: username.trim() });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username: username.trim(),
            password: hashedPassword,
            likedSongs: [],
            playlists: []
        });

        await user.save();
        
        // Send response without password
        const userResponse = user.toObject();
        delete userResponse.password;
        
        console.log('User registered successfully:', username);
        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Basic validation
        if (!username?.trim() || !password?.trim()) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find user and select password field
        const user = await User.findOne({ username: username.trim() })
            .select('+password')
            .populate('likedSongs');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Send response without password
        const userResponse = user.toObject();
        delete userResponse.password;

        console.log('User logged in successfully:', username);
        res.json(userResponse);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Playlist Routes
app.post('/api/users/:username/playlists', async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findOne({ username: req.params.username });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.playlists.push({
            name,
            songs: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await user.save();
        
        // Populate songs in response
        const updatedUser = await User.findById(user._id)
            .populate('playlists.songs')
            .populate('likedSongs');

        res.status(201).json(updatedUser);
    } catch (err) {
        console.error('Create playlist error:', err);
        res.status(500).json({ message: 'Failed to create playlist' });
    }
});

app.put('/api/users/:username/playlists/:playlistId', async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findOne({ username: req.params.username });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const playlist = user.playlists.id(req.params.playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        playlist.name = name;
        playlist.updatedAt = new Date();
        await user.save();

        const updatedUser = await User.findById(user._id)
            .populate('playlists.songs')
            .populate('likedSongs');

        res.json(updatedUser);
    } catch (err) {
        console.error('Update playlist error:', err);
        res.status(500).json({ message: 'Failed to update playlist' });
    }
});

app.get('/api/users/:username/playlists', async (req, res) => {
    try {
        // Explicitly populate all song fields we need
        const user = await User.findOne({ username: req.params.username })
            .populate({
                path: 'playlists.songs',
                model: 'Song',
                select: 'title artist coverUrl audioUrl _id'
            });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log the populated data
        console.log('Playlist songs populated:', 
            user.playlists.map(p => ({
                id: p._id,
                name: p.name,
                songCount: p.songs.length,
                firstSong: p.songs[0]
            }))
        );

        res.json(user.playlists);
    } catch (err) {
        console.error('Get playlists error:', err);
        res.status(500).json({ message: 'Failed to fetch playlists' });
    }
});

app.get('/api/users/:username/playlists/:playlistId', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .populate('playlists.songs');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const playlist = user.playlists.id(req.params.playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        res.json(playlist);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch playlist' });
    }
});

app.delete('/api/users/:username/playlists/:playlistId', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.playlists = user.playlists.filter(p => p._id.toString() !== req.params.playlistId);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete playlist' });
    }
});

app.post('/api/users/:username/playlists/:playlistId/songs', async (req, res) => {
    try {
        const { songId } = req.body;
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const playlist = user.playlists.id(req.params.playlistId);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        
        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to add song to playlist' });
    }
});

app.delete('/api/users/:username/playlists/:playlistId/songs/:songId', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const playlist = user.playlists.id(req.params.playlistId);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        
        playlist.songs = playlist.songs.filter(s => s.toString() !== req.params.songId);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove song from playlist' });
    }
});

// Like/Unlike Song Routes
app.post('/api/users/:username/likes/:songId', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user.likedSongs.includes(req.params.songId)) {
            user.likedSongs.push(req.params.songId);
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/users/:username/likes/:songId', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        user.likedSongs = user.likedSongs.filter(id => id.toString() !== req.params.songId);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });
    
    res.status(500).json({ 
        message: 'Internal server error', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
