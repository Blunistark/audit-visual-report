// Simple API server to receive screenshots from browser extension
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 8081;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const filename = `screenshot-${timestamp}.png`;
        cb(null, filename);
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Check if we're in development or production
const isDevelopment = !fs.existsSync(path.join(__dirname, '../../dist'));

if (!isDevelopment) {
    // Production: serve built files
    app.use(express.static(path.join(__dirname, '../../dist')));
}

// API endpoint to receive screenshots from browser extension
app.post('/api/screenshot', upload.single('screenshot'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No screenshot file provided' });
        }

        const { url, area } = req.body;
        const screenshot = {
            filename: req.file.filename,
            path: req.file.path,
            url: url,
            area: area ? JSON.parse(area) : null,
            timestamp: new Date().toISOString(),
            size: req.file.size
        };

        // Store screenshot info in memory (in production, use a database)
        if (!app.locals.screenshots) {
            app.locals.screenshots = [];
        }
        app.locals.screenshots.push(screenshot);

        console.log('Screenshot received:', {
            filename: screenshot.filename,
            url: screenshot.url,
            area: screenshot.area,
            size: screenshot.size
        });

        res.json({
            success: true,
            screenshot: {
                filename: screenshot.filename,
                url: `/uploads/${screenshot.filename}`,
                metadata: {
                    sourceUrl: screenshot.url,
                    area: screenshot.area,
                    timestamp: screenshot.timestamp
                }
            }
        });

        // Broadcast to connected clients that a new screenshot is available
        broadcastNewScreenshot(screenshot);

    } catch (error) {
        console.error('Error handling screenshot upload:', error);
        res.status(500).json({ error: 'Failed to process screenshot' });
    }
});

// Get recent screenshots
app.get('/api/screenshots', (req, res) => {
    const screenshots = app.locals.screenshots || [];
    res.json({
        screenshots: screenshots.slice(-10) // Return last 10 screenshots
    });
});

// Get specific screenshot
app.get('/api/screenshots/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Screenshot not found' });
    }
});

// WebSocket-like functionality for real-time updates (simple approach)
const connectedClients = new Set();

function broadcastNewScreenshot(screenshot) {
    // In a real implementation, you'd use WebSockets
    // For now, we'll just log that a screenshot is available
    console.log('New screenshot available for broadcast:', screenshot.filename);
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        screenshotsCount: (app.locals.screenshots || []).length
    });
});

// Serve the main app for all other routes (only in production)
app.get('*', (req, res) => {
    if (isDevelopment) {
        // In development, just return a simple message for non-API routes
        res.json({ 
            message: 'API server running in development mode',
            note: 'Main app should be served by Vite dev server on port 8080',
            apiEndpoint: '/api/screenshot'
        });
    } else {
        // In production, serve the built index.html
        res.sendFile(path.join(__dirname, '../../dist/index.html'));
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Screenshot API server running on http://localhost:${PORT}`);
    console.log(`📁 Screenshots will be saved to: ${uploadsDir}`);
    console.log(`🔗 API endpoint: http://localhost:${PORT}/api/screenshot`);
});
