import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from the server root if not already loaded
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'findateacher',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const checkConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
};

export default pool;
