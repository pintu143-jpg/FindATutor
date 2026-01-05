import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['https://findatutor1.vercel.app', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Serve static files from the React frontend app (Local Development Only)
if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // Anything that doesn't match the above, send back index.html
    app.get(/(.*)/, (req, res) => {
        // Skip API routes here to avoid conflicts if they were missed
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
        }
    });
}

// Start server only if not in Vercel environment (Vercel handles this)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
