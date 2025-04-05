require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

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
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'https://revifym.vercel.app',
        'https://revify-ten.vercel.app',
        'https://revify.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Define Song Schema
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

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
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

// Song routes
app.get('/api/songs', async (req, res) => {
    try {
        const songs = await Song.find();
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
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

// Update file upload route to handle errors better
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file && !req.body.data) {
            return res.status(400).json({ message: 'No file uploaded' });
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
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                
                uploadStream.end(req.file.buffer);
            });
        } else {
            uploadResponse = await cloudinary.uploader.upload(req.body.data, {
                resource_type: "auto",
                folder: "songs",
                upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default"
            });
        }

        console.log('Upload response:', uploadResponse);
        res.json({ url: uploadResponse.secure_url });
    } catch (err) {
        console.error('Server upload error:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

// Update song post route to handle audio URL and cover URL
app.post('/api/songs', async (req, res) => {
    const song = new Song({
        title: req.body.title,
        artist: req.body.artist,
        genre: req.body.genre,
        audioUrl: req.body.audioUrl,
        coverUrl: req.body.coverUrl
    });

    try {
        const newSong = await song.save();
        res.status(201).json(newSong);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        message: 'Internal server error', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
