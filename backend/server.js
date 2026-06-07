import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  UserModel, 
  TutorModel, 
  StudentRequestModel, 
  ChatSessionModel, 
  PlatformReviewModel 
} from './models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Safely initialize Gemini AI
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Database Connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("WARNING: MONGODB_URI is not set. Database operations will fail.");
} else {
  mongoose.connect(mongoUri)
    .then(() => console.log("MongoDB connected successfully."))
    .catch(err => console.error("MongoDB connection error:", err));
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const lowerEmail = email.toLowerCase();
    
    // Check Admin
    if (lowerEmail === 'admin@findateacher0143.com') {
      if (password === 'FindATeacher@Admin#2026') {
        const adminUser = {
          id: 'admin-system-user',
          name: 'Admin',
          email: email,
          avatar: `https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff`,
          role: 'admin',
          isAdmin: true
        };
        return res.json(adminUser);
      } else {
        return res.status(401).json({ error: "Invalid admin password. Admin account requires a strong secure password." });
      }
    }

    // Check Users
    const user = await UserModel.findOne({ email: new RegExp(`^${lowerEmail}$`, 'i') });
    if (user) {
      if (user.password === password) {
        // Return user structure
        return res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          phone: user.phone,
          address: user.address,
          gender: user.gender,
          schoolName: user.schoolName,
          grade: user.grade,
          isEmailVerified: user.isEmailVerified,
          status: user.status,
          joinedAt: user.joinedAt
        });
      } else {
        return res.status(401).json({ error: "Invalid password." });
      }
    }

    // Check Tutors if not in user model (for older records)
    const tutor = await TutorModel.findOne({ email: new RegExp(`^${lowerEmail}$`, 'i') });
    if (tutor) {
      // Create user record dynamically if missing
      const newUser = await UserModel.create({
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        password: 'password123',
        avatar: tutor.avatar,
        role: 'tutor',
        phone: tutor.phone,
        address: tutor.address,
        gender: tutor.gender,
        isEmailVerified: true,
        status: tutor.status === 'approved' ? 'active' : 'pending'
      });
      return res.json(newUser);
    }

    return res.status(404).json({ error: "Account not found. Please register first." });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { 
    id, name, email, password, role, phone, address, gender, schoolName, grade 
  } = req.body;
  
  try {
    const lowerEmail = email.toLowerCase();
    const existingUser = await UserModel.findOne({ email: new RegExp(`^${lowerEmail}$`, 'i') });
    if (existingUser) {
      return res.status(400).json({ error: "Account with this email already exists. Please log in." });
    }

    const isAdmin = lowerEmail === 'admin@findateacher0143.com';
    const finalRole = isAdmin ? 'admin' : role;

    const newUser = await UserModel.create({
      id,
      name: name || 'New User',
      email: lowerEmail,
      password: password || 'password123',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'New User')}&background=${finalRole === 'tutor' ? '6366f1' : '10b981'}&color=fff`,
      role: finalRole,
      phone,
      address,
      gender,
      schoolName: finalRole === 'student' ? schoolName : undefined,
      grade: finalRole === 'student' ? grade : undefined,
      isEmailVerified: false,
      status: finalRole === 'tutor' ? 'pending' : 'active',
      joinedAt: new Date()
    });

    // If registered as tutor, also create tutor profile record
    if (finalRole === 'tutor') {
      await TutorModel.create({
        id,
        name: name || 'New Tutor',
        avatar: newUser.avatar,
        email: lowerEmail,
        phone,
        address,
        gender,
        classMode: 'both',
        status: 'pending',
        subjects: [],
        bio: '',
        hourlyRate: 0,
        experienceYears: 0,
        rating: 0,
        reviews: 0,
        isVerified: false,
        levels: [],
        availability: '',
        city: address || '',
        reviewsList: []
      });
    }

    res.json(newUser);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// ==========================================
// TUTORS ENDPOINTS
// ==========================================

// Get Tutors
app.get('/api/tutors', async (req, res) => {
  try {
    const tutors = await TutorModel.find({});
    res.json(tutors);
  } catch (error) {
    console.error("Get tutors error:", error);
    res.status(500).json({ error: "Server error fetching tutors." });
  }
});

// Update Tutor Profile
app.put('/api/tutors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedTutor = await TutorModel.findOneAndUpdate(
      { id },
      { $set: req.body },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    // Sync Name/Avatar/Address in Users table
    if (updatedTutor) {
      await UserModel.findOneAndUpdate(
        { id },
        { 
          $set: { 
            name: updatedTutor.name, 
            avatar: updatedTutor.avatar,
            phone: updatedTutor.phone,
            address: updatedTutor.address,
            gender: updatedTutor.gender
          } 
        }
      );
    }
    
    res.json(updatedTutor);
  } catch (error) {
    console.error("Update tutor error:", error);
    res.status(500).json({ error: "Server error updating tutor profile." });
  }
});

// Admin Approve/Reject Tutor
app.put('/api/tutors/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // approved / rejected
  try {
    const tutor = await TutorModel.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true }
    );
    
    if (tutor) {
      await UserModel.findOneAndUpdate(
        { id },
        { $set: { status: status === 'approved' ? 'active' : 'pending' } }
      );
    }
    
    res.json(tutor);
  } catch (error) {
    console.error("Tutor status update error:", error);
    res.status(500).json({ error: "Server error updating tutor status." });
  }
});

// Admin Verify Tutor
app.put('/api/tutors/:id/verify', async (req, res) => {
  const { id } = req.params;
  const { isVerified } = req.body;
  try {
    const tutor = await TutorModel.findOneAndUpdate(
      { id },
      { $set: { isVerified } },
      { new: true }
    );
    res.json(tutor);
  } catch (error) {
    console.error("Tutor verify error:", error);
    res.status(500).json({ error: "Server error toggling tutor verification." });
  }
});

// Add Review to Tutor
app.post('/api/tutors/:id/reviews', async (req, res) => {
  const { id } = req.params;
  const review = req.body;
  try {
    const tutor = await TutorModel.findOne({ id });
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found." });
    }

    tutor.reviewsList.unshift(review);
    
    const total = tutor.reviewsList.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((total / tutor.reviewsList.length).toFixed(1));
    
    tutor.rating = avg;
    tutor.reviews = tutor.reviewsList.length;
    
    await tutor.save();
    res.json(tutor);
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ error: "Server error adding review." });
  }
});

// ==========================================
// STUDENTS ENDPOINTS
// ==========================================

// Get Students list
app.get('/api/students', async (req, res) => {
  try {
    const students = await UserModel.find({ role: 'student' });
    res.json(students);
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ error: "Server error fetching students." });
  }
});

// Update Student Profile
app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { id },
      { $set: req.body },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).json({ error: "Server error updating student profile." });
  }
});

// ==========================================
// STUDENT REQUESTS ENDPOINTS
// ==========================================

// Get Student Requests
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await StudentRequestModel.find({});
    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ error: "Server error fetching requests." });
  }
});

// Create Request
app.post('/api/requests', async (req, res) => {
  try {
    const newRequest = await StudentRequestModel.create(req.body);
    res.json(newRequest);
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ error: "Server error creating request." });
  }
});

// Match / Link Request
app.put('/api/requests/:id/match', async (req, res) => {
  const { id } = req.params;
  const { assignedTutorId } = req.body;
  try {
    const request = await StudentRequestModel.findOneAndUpdate(
      { id },
      { $set: { status: 'matched', assignedTutorId } },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    const studentId = request.studentId;
    const tutorId = assignedTutorId;

    // Check if chat session already exists between student and tutor
    let session = await ChatSessionModel.findOne({
      participantIds: { $all: [studentId, tutorId] }
    });

    const studentName = request.studentName;
    const tutor = await TutorModel.findOne({ id: tutorId });
    const tutorName = tutor ? tutor.name : 'Tutor';

    const systemMessageText = `Admin linked Student ${studentName} with Tutor ${tutorName}. Chat is now enabled.`;
    const newSystemMessage = {
      id: `msg-log-${Date.now()}`,
      senderId: 'admin-system-user',
      text: systemMessageText,
      timestamp: new Date()
    };

    if (!session) {
      // Create new session
      session = await ChatSessionModel.create({
        id: `chat-st-${Date.now()}`,
        participantIds: [studentId, tutorId],
        messages: [newSystemMessage],
        lastMessagePreview: systemMessageText,
        updatedAt: new Date(),
        unreadCount: 1
      });
    } else {
      // Append system message to existing session
      session.messages.push(newSystemMessage);
      session.lastMessagePreview = systemMessageText;
      session.updatedAt = new Date();
      session.unreadCount += 1;
      await session.save();
    }

    res.json({ request, chatSession: session });
  } catch (error) {
    console.error("Match request error:", error);
    res.status(500).json({ error: "Server error matching request." });
  }
});

// ==========================================
// CHAT ENDPOINTS
// ==========================================

// Get Chat Sessions
app.get('/api/chats', async (req, res) => {
  const { userId } = req.query;
  try {
    let sessions;
    if (userId === 'admin-system-user') {
      // Admin sees all chat sessions
      sessions = await ChatSessionModel.find({}).sort({ updatedAt: -1 });
    } else {
      // Students/Tutors see only their own threads
      sessions = await ChatSessionModel.find({
        participantIds: userId
      }).sort({ updatedAt: -1 });
    }
    res.json(sessions);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ error: "Server error fetching chat sessions." });
  }
});

// Get Chat Session by ID
app.get('/api/chats/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const session = await ChatSessionModel.findOne({ id });
    if (!session) return res.status(404).json({ error: "Chat session not found." });
    res.json(session);
  } catch (error) {
    console.error("Get chat by ID error:", error);
    res.status(500).json({ error: "Server error fetching chat session." });
  }
});

// Send Message
app.post('/api/chats/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { senderId, text, activeSessionId } = req.body;
  try {
    const session = await ChatSessionModel.findOne({ id });
    if (!session) return res.status(404).json({ error: "Chat session not found." });

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      text,
      timestamp: new Date()
    };

    session.messages.push(newMessage);
    session.lastMessagePreview = text;
    session.updatedAt = new Date();

    // Increment unread count if recipient is not currently viewing
    // In our simplified app, the server will increment it. If frontend active session equals this session, frontend will immediately call 'read' endpoint.
    if (activeSessionId !== id) {
      session.unreadCount += 1;
    }

    await session.save();
    res.json(session);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Server error sending message." });
  }
});

// Mark Session as Read
app.put('/api/chats/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const session = await ChatSessionModel.findOneAndUpdate(
      { id },
      { $set: { unreadCount: 0 } },
      { new: true }
    );
    res.json(session);
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ error: "Server error marking messages as read." });
  }
});

// Post System Log Message (login/logout logs)
app.post('/api/chats/system-log', async (req, res) => {
  const { userId, logText } = req.body;
  try {
    // Check if support session exists with admin
    let session = await ChatSessionModel.findOne({
      participantIds: { $all: [userId, 'admin-system-user'] }
    });

    const newLogMessage = {
      id: `msg-log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      senderId: 'admin-system-user',
      text: logText,
      timestamp: new Date()
    };

    if (!session) {
      session = await ChatSessionModel.create({
        id: `chat-admin-${Date.now()}`,
        participantIds: [userId, 'admin-system-user'],
        messages: [newLogMessage],
        lastMessagePreview: logText,
        updatedAt: new Date(),
        unreadCount: 1
      });
    } else {
      session.messages.push(newLogMessage);
      session.lastMessagePreview = logText;
      session.updatedAt = new Date();
      // Only increment unread if not read
      session.unreadCount += 1;
      await session.save();
    }

    res.json(session);
  } catch (error) {
    console.error("System log error:", error);
    res.status(500).json({ error: "Server error posting system log." });
  }
});

// ==========================================
// PLATFORM REVIEWS ENDPOINTS
// ==========================================

// Get Reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await PlatformReviewModel.find({}).sort({ date: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ error: "Server error fetching reviews." });
  }
});

// Submit Platform Review
app.post('/api/reviews', async (req, res) => {
  try {
    const newReview = await PlatformReviewModel.create(req.body);
    res.json(newReview);
  } catch (error) {
    console.error("Submit review error:", error);
    res.status(500).json({ error: "Server error submitting platform review." });
  }
});

// Update Platform Review Status (Approve/Reject/Delete)
app.put('/api/reviews/:id/status', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // approve / reject / delete
  try {
    if (action === 'delete') {
      await PlatformReviewModel.findOneAndDelete({ id });
      return res.json({ success: true, id });
    }

    const review = await PlatformReviewModel.findOneAndUpdate(
      { id },
      { $set: { status: action === 'approve' ? 'approved' : 'rejected' } },
      { new: true }
    );
    res.json(review);
  } catch (error) {
    console.error("Review action error:", error);
    res.status(500).json({ error: "Server error updating review status." });
  }
});

// ==========================================
// GEMINI AI SECURE SERVICE ENDPOINTS
// ==========================================

// Generate Tutor Bio
app.post('/api/ai/generate-bio', async (req, res) => {
  const { experience, subjects, style } = req.body;
  try {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are an expert copywriter for an educational platform. 
      Write a professional, engaging, and trustworthy bio (max 80 words) for a tutor with the following details:
      - Experience: ${experience}
      - Subjects: ${subjects}
      - Teaching Style: ${style}
      
      Instructions:
      1. Naturally incorporate relevant keywords and terminology associated with the subjects listed.
      2. Reflect the 'Teaching Style' in the tone of the bio.
      3. Do not include "Here is a bio" or quotes. Just the raw bio text.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    res.json({ text: response.text || "Experienced tutor ready to help you learn." });
  } catch (error) {
    console.error("AI Generate Bio error:", error);
    res.status(500).json({ error: "AI bio generation failed." });
  }
});

// Smart Match
app.post('/api/ai/smart-match', async (req, res) => {
  const { userQuery, tutors } = req.body;
  try {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    
    const tutorContext = tutors.map(t => ({
      id: t.id,
      name: t.name,
      subjects: t.subjects.join(", "),
      bio: t.bio,
      rate: t.hourlyRate,
      city: t.city
    }));

    const prompt = `
      You are an intelligent educational consultant.
      User Request: "${userQuery}"

      Available Tutors:
      ${JSON.stringify(tutorContext)}

      Task:
      1. Analyze the user's request and the tutors' profiles.
      2. Select up to 3 tutor IDs that best match the user's specific needs (subject, level, price sensitivity, location, or specific keywords).
      3. Provide a very brief reasoning (max 1 sentence) explaining why these tutors were selected as a group.

      Output JSON format:
      {
        "recommendedTutorIds": ["id1", "id2"],
        "reasoning": "We selected these tutors because..."
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedTutorIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    res.json(JSON.parse(jsonText));
  } catch (error) {
    console.error("AI Smart Match error:", error);
    res.status(500).json({ error: "AI smart matchmaking failed." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
