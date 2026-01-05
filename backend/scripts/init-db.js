import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from the server root
dotenv.config({ path: path.join(__dirname, '../.env') });

const initDb = async () => {
    try {
        // Create connection without database selected to create it if needed
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
        });

        const dbName = process.env.DB_NAME || 'findateacher';

        console.log(`Checking database ${dbName}...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`Database ${dbName} created or already exists.`);

        // Switch to the database
        await connection.changeUser({ database: dbName });

        // Read schema.sql
        const schemaPath = path.join(__dirname, '../schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split queries by semicolon (simple split, might need more robust parsing for complex schemas but fine for now)
        const queries = schema.split(';').filter(q => q.trim());

        console.log('Running schema queries...');
        for (let query of queries) {
            if (query.trim()) {
                await connection.query(query);
            }
        }

        console.log('Database initialized successfully.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
};

console.log('Starting initDb...');
initDb();
