
export interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

export type TutorStatus = 'pending' | 'approved' | 'rejected';
export type ClassMode = 'online' | 'offline' | 'both';

export interface PlatformReview {
  id: string;
  studentId: string;
  name: string;
  role: 'Student' | 'Tutor';
  image: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  bio: string;
  hourlyRate: number;
  rating: number;
  reviews: number;
  experienceYears: number;
  isVerified: boolean;
  availability: string;
  reviewsList: Review[];
  levels: string[];
  status: TutorStatus;
  email?: string;
  phone?: string;
  address?: string;
  gender?: string;
  qualifications?: string;
  resume?: string;
  classMode: ClassMode;
  city: string;
  assignedStudents?: { studentId: string; studentName: string; requestId: string }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'tutor' | 'admin';
  phone?: string;
  address?: string;
  gender?: string;
  schoolName?: string;
  grade?: string;
  isEmailVerified?: boolean;
  isAdmin?: boolean;
  status?: 'active' | 'pending' | 'suspended';
  joinedAt?: Date;
}

export interface StudentRequest {
  id: string;
  studentId: string;
  studentName: string;
  avatar: string;
  subject: string;
  level: string;
  mode: ClassMode;
  location: string;
  description: string;
  budget: number;
  postedAt: Date;
  status: 'pending' | 'matched' | 'closed';
  assignedTutorId?: string; // @deprecated use assignedTutorIds
  assignedTutorIds?: string[];
  preferredTutorId?: string;
  preferredTutorName?: string;
  isApproved?: boolean;
}

export interface SearchFilters {
  subject: string;
  maxPrice: number;
  minRating: number;
}

export type ViewState = 'home' | 'find-tutor' | 'find-students' | 'become-tutor' | 'login' | 'tutor-profile' | 'admin-dashboard' | 'chat' | 'tutor-dashboard' | 'student-dashboard' | 'about';

export interface SmartMatchResponse {
  recommendedTutorIds: string[];
  reasoning: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  participantIds: string[];
  messages: ChatMessage[];
  lastMessagePreview: string;
  updatedAt: Date;
  unreadCount: number; // Added to track unread messages
}