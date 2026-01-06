import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from the server root if not already loaded
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        // Fallback URI for direct deployment if env var is not set
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pintukumar3415_db_user:X4VOQNL06R4emwCW@findatutor1.lyzjdmg.mongodb.net/';
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return false;
    }
};

// Auto-connect when imported
connectDB();

export const checkConnection = async () => {
    return mongoose.connection.readyState === 1;
};

export default mongoose;
