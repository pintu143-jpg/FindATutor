import { User, Tutor, StudentRequest, ChatSession, PlatformReview, SmartMatchResponse, Review } from '../types';

// Detect Backend URL from environment variables or fallback to localhost
const BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const apiService = {
  // Authentication
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return handleResponse(response);
    },
    register: async (userData: Partial<User> & { password?: string }): Promise<User> => {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(response);
    }
  },

  // Tutors
  tutors: {
    getAll: async (): Promise<Tutor[]> => {
      const response = await fetch(`${BASE_URL}/api/tutors`);
      return handleResponse(response);
    },
    update: async (id: string, tutorData: Partial<Tutor>): Promise<Tutor> => {
      const response = await fetch(`${BASE_URL}/api/tutors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tutorData)
      });
      return handleResponse(response);
    },
    updateStatus: async (id: string, status: 'approved' | 'rejected'): Promise<Tutor> => {
      const response = await fetch(`${BASE_URL}/api/tutors/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return handleResponse(response);
    },
    verify: async (id: string, isVerified: boolean): Promise<Tutor> => {
      const response = await fetch(`${BASE_URL}/api/tutors/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified })
      });
      return handleResponse(response);
    },
    addReview: async (tutorId: string, review: Review): Promise<Tutor> => {
      const response = await fetch(`${BASE_URL}/api/tutors/${tutorId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      return handleResponse(response);
    }
  },

  // Students
  students: {
    getAll: async (): Promise<User[]> => {
      const response = await fetch(`${BASE_URL}/api/students`);
      return handleResponse(response);
    },
    updateProfile: async (id: string, studentData: Partial<User>): Promise<User> => {
      const response = await fetch(`${BASE_URL}/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      return handleResponse(response);
    }
  },

  // Student Requests
  requests: {
    getAll: async (): Promise<StudentRequest[]> => {
      const response = await fetch(`${BASE_URL}/api/requests`);
      return handleResponse(response);
    },
    create: async (requestData: Partial<StudentRequest>): Promise<StudentRequest> => {
      const response = await fetch(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      return handleResponse(response);
    },
    matchRequest: async (requestId: string, assignedTutorId: string): Promise<{ request: StudentRequest; chatSession: ChatSession }> => {
      const response = await fetch(`${BASE_URL}/api/requests/${requestId}/match`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTutorId })
      });
      return handleResponse(response);
    }
  },

  // Chats
  chats: {
    getAll: async (userId: string): Promise<ChatSession[]> => {
      const response = await fetch(`${BASE_URL}/api/chats?userId=${userId}`);
      return handleResponse(response);
    },
    sendMessage: async (sessionId: string, senderId: string, text: string, activeSessionId: string | null): Promise<ChatSession> => {
      const response = await fetch(`${BASE_URL}/api/chats/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, text, activeSessionId })
      });
      return handleResponse(response);
    },
    markAsRead: async (sessionId: string): Promise<ChatSession> => {
      const response = await fetch(`${BASE_URL}/api/chats/${sessionId}/read`, {
        method: 'PUT'
      });
      return handleResponse(response);
    },
    sendSystemLog: async (userId: string, logText: string): Promise<ChatSession> => {
      const response = await fetch(`${BASE_URL}/api/chats/system-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, logText })
      });
      return handleResponse(response);
    }
  },

  // Platform Reviews
  reviews: {
    getAll: async (): Promise<PlatformReview[]> => {
      const response = await fetch(`${BASE_URL}/api/reviews`);
      return handleResponse(response);
    },
    create: async (reviewData: Partial<PlatformReview>): Promise<PlatformReview> => {
      const response = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      return handleResponse(response);
    },
    updateStatus: async (id: string, action: 'approve' | 'reject' | 'delete'): Promise<any> => {
      const response = await fetch(`${BASE_URL}/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      return handleResponse(response);
    }
  },

  // AI Service
  ai: {
    generateBio: async (experience: string, subjects: string, style: string): Promise<string> => {
      const response = await fetch(`${BASE_URL}/api/ai/generate-bio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience, subjects, style })
      });
      const data = await handleResponse(response);
      return data.text;
    },
    smartMatch: async (userQuery: string, tutors: Tutor[]): Promise<SmartMatchResponse> => {
      const response = await fetch(`${BASE_URL}/api/ai/smart-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery, tutors })
      });
      return handleResponse(response);
    }
  }
};
