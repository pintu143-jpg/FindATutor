import express from 'express';
import { checkConnection } from '../config/db.js';

const router = express.Router();

import pool from '../config/db.js';

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
        const { type, genderPref, mode, location, subject, level, budget } = req.body;

        // Basic validation
        if (!type || !mode || !location || !subject || !level || !budget) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [result] = await pool.query(
            'INSERT INTO student_requests (type, gender_pref, mode, location, subject, level, budget) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [type, genderPref, mode, location, subject, level, budget]
        );

        res.status(201).json({
            message: 'Request created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ error: 'Failed to create request' });
    }
});

export default router;
