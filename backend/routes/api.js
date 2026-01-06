import express from 'express';
import { checkConnection } from '../config/db.js';
import StudentRequest from '../models/studentRequest.js';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
    const dbStatus = await checkConnection();
    res.json({
        status: 'ok',
        timestamp: new Date(),
        database: dbStatus ? 'connected' : 'disconnected'
    });
});

// Create new student request
router.post('/requests', async (req, res) => {
    try {
        const { type, genderPref, mode, location, subject, level, budget, studentId, studentName } = req.body;

        // Basic validation
        if (!type || !mode || !location || !subject || !level || !budget) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newRequest = await StudentRequest.create({
            type,
            genderPref: genderPref || 'Any',
            mode,
            location,
            subject,
            level,
            budget,
            studentId,
            studentName
        });

        res.status(201).json({
            message: 'Request created successfully',
            id: newRequest._id
        });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ error: 'Failed to create request' });
    }
});

export default router;
