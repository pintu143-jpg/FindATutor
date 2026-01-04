import pool from './config/db.js';

async function checkRequests() {
    try {
        console.log('Checking database for student requests...');
        const [rows] = await pool.query('SELECT * FROM student_requests ORDER BY created_at DESC LIMIT 5');

        if (rows.length === 0) {
            console.log('No requests found in the database.');
        } else {
            console.log('Found requests:');
            console.table(rows);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error checking database:', error);
        process.exit(1);
    }
}

checkRequests();
