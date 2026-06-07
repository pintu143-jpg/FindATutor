import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  id: { type: String, required: true },
  studentName: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: String, required: true }
});

const TutorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String, required: true },
  subjects: [{ type: String }],
  bio: { type: String, default: '' },
  hourlyRate: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  experienceYears: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  availability: { type: String, default: '' },
  levels: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  gender: { type: String },
  qualifications: { type: String },
  resume: { type: String },
  classMode: { type: String, enum: ['online', 'offline', 'both'], default: 'both' },
  city: { type: String, default: '' },
  reviewsList: [ReviewSchema]
});

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: 'password123' }, // Simple password for login validation
  avatar: { type: String, required: true },
  role: { type: String, enum: ['student', 'tutor', 'admin'], required: true },
  phone: { type: String },
  address: { type: String },
  gender: { type: String },
  schoolName: { type: String },
  grade: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'pending', 'suspended'], default: 'active' },
  joinedAt: { type: Date, default: Date.now }
});

const StudentRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  avatar: { type: String, required: true },
  subject: { type: String, required: true },
  level: { type: String, required: true },
  mode: { type: String, enum: ['online', 'offline', 'both'], default: 'both' },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
  budget: { type: Number, default: 0 },
  postedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'matched', 'closed'], default: 'pending' },
  assignedTutorId: { type: String }
});

const ChatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatSessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  participantIds: [{ type: String }],
  messages: [ChatMessageSchema],
  lastMessagePreview: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  unreadCount: { type: Number, default: 0 }
});

const PlatformReviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Tutor'], required: true },
  image: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  date: { type: String, required: true }
});

export const TutorModel = mongoose.model('Tutor', TutorSchema);
export const UserModel = mongoose.model('User', UserSchema);
export const StudentRequestModel = mongoose.model('StudentRequest', StudentRequestSchema);
export const ChatSessionModel = mongoose.model('ChatSession', ChatSessionSchema);
export const PlatformReviewModel = mongoose.model('PlatformReview', PlatformReviewSchema);
