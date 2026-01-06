import mongoose from 'mongoose';

const studentRequestSchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., 'Tutor' or 'Student'
    genderPref: { type: String, required: true },
    mode: { type: String, required: true, enum: ['online', 'offline', 'both'] },
    location: { type: String, required: true },
    subject: { type: String, required: true },
    level: { type: String, required: true },
    budget: { type: Number, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'matched', 'closed'] },
    createdAt: { type: Date, default: Date.now },
    studentId: { type: String }, // Optional: link to a user if authenticated
    studentName: { type: String } // Optional: for display
});

const StudentRequest = mongoose.model('StudentRequest', studentRequestSchema);

export default StudentRequest;
