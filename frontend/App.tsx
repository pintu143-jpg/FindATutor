import { Analytics } from '@vercel/analytics/react';
import React, { useState, useMemo, useEffect } from 'react';
import { Search, GraduationCap, Users, ArrowRight, ArrowLeft, Star, Clock, CheckCircle2, BookOpen, Sparkles, Filter, LogOut, User as UserIcon, Shield, MessageCircle, LayoutDashboard, Sun, Moon, MapPin, Monitor, Building2, Quote, TrendingUp, Globe, Music, Briefcase, Bell, DollarSign, X, Check, Mail, Phone, Lock, ChevronRight, Home, Menu, Heart, Facebook, Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react';
import { MOCK_TUTORS, MOCK_REQUESTS, MOCK_USERS, SUBJECTS, LEVELS, ADMIN_ID } from './constants';
import { ViewState, User, Tutor, ChatSession, ClassMode, StudentRequest, PlatformReview, ChatMessage, Review } from './types';
import BecomeTutor from './components/BecomeTutor';
import SmartMatchModal from './components/SmartMatchModal';
import AuthPage from './components/AuthPage';
import TutorProfile from './components/TutorProfile';
import AdminDashboard from './components/AdminDashboard';
import ChatWindow from './components/ChatWindow';
import TutorDashboard from './components/TutorDashboard';
import StudentDashboard from './components/StudentDashboard';
import StudentRequestWizard from './components/StudentRequestWizard';
import StudentRequestsBoard from './components/StudentRequestsBoard';
import AboutPage from './components/AboutPage';

// Data for Home Page Info Sections
const COVERED_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "Hindi", "Social Studies", "Computer Science", "Economics",
  "Accountancy", "Business Studies", "Geography"
];

const COVERED_CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad",
  "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow",
  "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal"
];

const COVERED_CLASSES = [
  "Class IV", "Class V", "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII"
];

// Initial Dummy Data for Student Feedback (Converted to PlatformReview type)
const INITIAL_REVIEWS: PlatformReview[] = [
  {
    id: '1',
    studentId: 'S-001', // Matches Alex Mitchell in MOCK_USERS
    name: "Alex Mitchell",
    role: "Student",
    image: "https://ui-avatars.com/api/?name=Alex+Mitchell&background=random",
    content: "Found an amazing physics tutor in 2 days. The AI match was spot on! My grades have improved significantly since starting lessons.",
    rating: 5,
    status: 'approved',
    date: new Date().toISOString()
  },
  {
    id: '2',
    studentId: 'u-static-2',
    name: "Priya Patel",
    role: "Student",
    image: "https://ui-avatars.com/api/?name=Priya+Patel&background=random",
    content: "I love the offline mode option. Found a guitar teacher right in my neighborhood. Highly recommended for local learning!",
    rating: 4,
    status: 'approved',
    date: new Date().toISOString()
  },
  {
    id: '3',
    studentId: 'u-static-3',
    name: "Rahul Sharma",
    role: "Student",
    image: "https://ui-avatars.com/api/?name=Rahul+Sharma&background=random",
    content: "Great platform for finding specific subject experts. My math scores went from C to A in one term.",
    rating: 5,
    status: 'approved',
    date: new Date().toISOString()
  },
  {
    id: '4',
    studentId: 'u-static-4',
    name: "Emily Clark",
    role: "Student",
    image: "https://ui-avatars.com/api/?name=Emily+Clark&background=random",
    content: "The tutors are very professional and punctual. The dashboard is very easy to use and manage my schedule.",
    rating: 5,
    status: 'approved',
    date: new Date().toISOString()
  },
  {
    id: 't-1',
    studentId: 'T-001',
    name: "Sarah Jenkins",
    role: "Tutor",
    image: "https://picsum.photos/seed/sarah/200/200",
    content: "As a tutor, this platform has helped me connect with so many motivated students. The dashboard makes scheduling effortless.",
    rating: 5,
    status: 'approved',
    date: new Date().toISOString()
  },
  {
    id: 't-2',
    studentId: 'T-002',
    name: "David Chen",
    role: "Tutor",
    image: "https://picsum.photos/seed/david/200/200",
    content: "The student matching system is excellent. I get inquiries that match my exact expertise in English Literature.",
    rating: 5,
    status: 'approved',
    date: new Date().toISOString()
  }
];

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [previousView, setPreviousView] = useState<ViewState>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('all'); // 'all', 'online', 'offline', 'both'

  // Advanced Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [minExperience, setMinExperience] = useState<string>('');

  const [isSmartMatchOpen, setIsSmartMatchOpen] = useState(false);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize darkMode based on system preference
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Notification State
  const [showNotification, setShowNotification] = useState(false);

  // Pending Actions (e.g. open wizard after login)
  const [pendingAction, setPendingAction] = useState<'wizard' | 'become-tutor' | 'find-tutor' | 'find-students' | 'smart-match' | 'view-profile' | null>(null);

  // Data State
  const [tutors, setTutors] = useState<Tutor[]>(MOCK_TUTORS);
  const [students, setStudents] = useState<User[]>(MOCK_USERS);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>(MOCK_REQUESTS);
  const [platformReviews, setPlatformReviews] = useState<PlatformReview[]>(INITIAL_REVIEWS);

  // Sync with Mock Data on Load to fix Demo Login issues (HMR/Reload consistency)
  useEffect(() => {
    setStudents(MOCK_USERS);
    setTutors(MOCK_TUTORS);
  }, []); // Run once on mount

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Tutor Selection State
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);

  // Smart match state
  const [smartMatchIds, setSmartMatchIds] = useState<string[]>([]);
  const [smartMatchReasoning, setSmartMatchReasoning] = useState<string>('');
  const [isSmartMatchActive, setIsSmartMatchActive] = useState(false);

  // Chat State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Success Modals
  const [showRequestSuccess, setShowRequestSuccess] = useState(false);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);

  // Calculate Total Unread Messages
  const totalUnreadCount = useMemo(() => {
    return chatSessions.reduce((acc, session) => acc + (session.unreadCount || 0), 0);
  }, [chatSessions]);

  // Simulate receiving a message for demonstration purposes
  useEffect(() => {
    if (currentUser && chatSessions.length === 0) {
      const timer = setTimeout(() => {
        const adminSessionId = `chat-admin-${Date.now()}`;
        const newSession: ChatSession = {
          id: adminSessionId,
          participantIds: [currentUser.id, ADMIN_ID],
          messages: [{
            id: `msg-admin-welcome`,
            senderId: ADMIN_ID,
            text: `Welcome to FindATeacher, ${currentUser.name}! How can we help you today?`,
            timestamp: new Date()
          }],
          lastMessagePreview: `Welcome to FindATeacher, ${currentUser.name}! How can we help you today?`,
          updatedAt: new Date(),
          unreadCount: 1
        };
        setChatSessions([newSession]);
      }, 3000); // 3 seconds after login/load if no chats
      return () => clearTimeout(timer);
    }
  }, [currentUser, chatSessions.length]);

  // Timer for Notification (Toast)
  useEffect(() => {
    // If user is logged in as tutor or admin, do not show notification
    if (currentUser && currentUser.role !== 'student') {
      setShowNotification(false);
      return;
    }

    const timer = setTimeout(() => {
      // Show if on home page and no modals open
      if (view === 'home' && !isWizardOpen && !isSmartMatchOpen) {
        setShowNotification(true);
      }
    }, 10000); // Show after 10 seconds

    return () => clearTimeout(timer);
  }, [view, isWizardOpen, isSmartMatchOpen, currentUser]);

  // Theme Logic
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Separate Reviews by Role
  const studentReviews = useMemo(() => {
    return platformReviews.filter(review => review.status === 'approved' && review.role === 'Student');
  }, [platformReviews]);

  const tutorReviews = useMemo(() => {
    return platformReviews.filter(review => review.status === 'approved' && review.role === 'Tutor');
  }, [platformReviews]);

  // Computed public tutors based on filters and approved status
  const filteredTutors = useMemo(() => {
    // Only show approved tutors to the public
    let candidates = tutors.filter(t => t.status === 'approved');

    // If smart match is active, prioritize smart matches and maintain their order
    if (isSmartMatchActive && smartMatchIds.length > 0) {
      return smartMatchIds
        .map(id => candidates.find(t => t.id === id))
        .filter((t): t is Tutor => !!t);
    }

    // Step 1: Standard Filters
    let results = candidates.filter(tutor => {
      const matchesSubject = selectedSubject ? tutor.subjects.includes(selectedSubject) : true;
      const matchesLevel = selectedLevel ? tutor.levels.includes(selectedLevel) : true;

      // City Filter
      const matchesCity = selectedCity ? tutor.city.toLowerCase().includes(selectedCity.toLowerCase()) : true;

      // Mode Filter
      let matchesMode = true;
      if (selectedMode === 'online') {
        matchesMode = tutor.classMode === 'online' || tutor.classMode === 'both';
      } else if (selectedMode === 'offline') {
        matchesMode = tutor.classMode === 'offline' || tutor.classMode === 'both';
      } else if (selectedMode === 'both') {
        matchesMode = tutor.classMode === 'both';
      }

      // Advanced Filters
      const matchesRating = tutor.rating >= minRating;

      let matchesPrice = true;
      if (priceMin && tutor.hourlyRate < parseInt(priceMin)) matchesPrice = false;
      if (priceMax && tutor.hourlyRate > parseInt(priceMax)) matchesPrice = false;

      let matchesExperience = true;
      if (minExperience && tutor.experienceYears < parseInt(minExperience)) matchesExperience = false;

      return matchesSubject && matchesLevel && matchesCity && matchesMode && matchesRating && matchesPrice && matchesExperience;
    });

    // Step 2: Advanced Search Term Filtering & Ranking
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase().trim();

      // Filter: Must match somewhere
      results = results.filter(tutor =>
        tutor.name.toLowerCase().includes(lowerTerm) ||
        tutor.bio.toLowerCase().includes(lowerTerm) ||
        tutor.subjects.some(s => s.toLowerCase().includes(lowerTerm)) ||
        tutor.city.toLowerCase().includes(lowerTerm)
      );

      // Sort: Calculate Relevance Score
      results.sort((a, b) => {
        const calculateScore = (t: Tutor) => {
          let score = 0;
          const nameLower = t.name.toLowerCase();

          // Name Matches: High priority
          if (nameLower === lowerTerm) score += 50;
          else if (nameLower.startsWith(lowerTerm)) score += 30;
          else if (nameLower.includes(lowerTerm)) score += 20;

          // Subject Matches: High priority
          if (t.subjects.some(s => s.toLowerCase() === lowerTerm)) score += 40;
          else if (t.subjects.some(s => s.toLowerCase().includes(lowerTerm))) score += 25;

          // City Match
          if (t.city.toLowerCase().includes(lowerTerm)) score += 10;

          // Bio Match: Lower priority
          if (t.bio.toLowerCase().includes(lowerTerm)) score += 5;

          return score;
        };

        const scoreA = calculateScore(a);
        const scoreB = calculateScore(b);

        // 1. Sort by Relevance Score
        if (scoreB !== scoreA) return scoreB - scoreA;

        // 2. Sort by Rating
        if (b.rating !== a.rating) return b.rating - a.rating;

        // 3. Sort by Review Count
        return b.reviews - a.reviews;
      });
    } else {
      // Default Sort: Rating Descending, then Reviews
      results.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviews - a.reviews;
      });
    }

    return results;
  }, [searchTerm, selectedSubject, selectedLevel, selectedCity, selectedMode, minRating, priceMin, priceMax, minExperience, smartMatchIds, isSmartMatchActive, tutors]);

  // Protected Action Handler
  const handleAuthAction = (action: () => void, pendingType: typeof pendingAction) => {
    if (currentUser) {
      action();
    } else {
      setPendingAction(pendingType);
      setView('login');
    }
  };

  // Handlers
  const handleLogin = (user: User) => {
    // ... existing login logic
    let authenticatedUser = user;
    let nextView: ViewState = 'home';

    if (user.isAdmin) {
      authenticatedUser = user;
      nextView = 'admin-dashboard';
    } else {
      // Check if existing tutor by email
      const matchedTutor = tutors.find(t => t.email === user.email);

      if (matchedTutor) {
        // If email matches existing tutor, log them in as tutor
        authenticatedUser = { ...user, role: 'tutor', id: matchedTutor.id };
        // Redirect to Home as per requirement, unless forced otherwise
        nextView = 'home';
      } else if (user.role === 'tutor') {
        // Newly registered tutor via AuthPage
        nextView = 'become-tutor';
        authenticatedUser = { ...user, role: 'tutor' };
      } else {
        // Regular Student Login
        authenticatedUser = { ...user, role: 'student' };
        nextView = 'home';
      }
    }

    setCurrentUser(authenticatedUser);
    setView(nextView);

    // Handle Pending Actions after Login
    if (pendingAction === 'wizard') {
      if (authenticatedUser.role === 'student') {
        // Delay slightly to allow UI transition
        setTimeout(() => setIsWizardOpen(true), 100);
      } else {
        alert('The wizard is optimized for students.');
      }
      setPendingAction(null);
    } else if (pendingAction === 'become-tutor') {
      if (authenticatedUser.role !== 'tutor') {
        setView('become-tutor');
      }
      setPendingAction(null);
    } else if (pendingAction === 'find-tutor') {
      setView('find-tutor');
      setPendingAction(null);
    } else if (pendingAction === 'find-students') {
      setView('find-students');
      setPendingAction(null);
    } else if (pendingAction === 'smart-match') {
      setTimeout(() => setIsSmartMatchOpen(true), 100);
      setPendingAction(null);
    } else if (pendingAction === 'view-profile') {
      setView('tutor-profile');
      setPendingAction(null);
    }
  };

  const handleRegister = (newUser: User) => {
    if (newUser.role === 'student') {
      setStudents([...students, newUser]);
    } else if (newUser.role === 'tutor') {
      // Create a new Tutor profile from the User registration data
      const newTutorProfile: Tutor = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        subjects: [],
        bio: 'Welcome! Please edit your profile to add your bio.',
        hourlyRate: 0,
        rating: 0,
        reviews: 0,
        experienceYears: 0,
        isVerified: false,
        availability: 'Flexible',
        reviewsList: [],
        levels: [],
        status: 'pending',
        classMode: 'online',
        city: newUser.address ? newUser.address.split(',')[0] : 'Unknown',
        phone: newUser.phone
      };
      setTutors(prev => [...prev, newTutorProfile]);
    }
    // setCurrentUser is handled in handleLogin which is called after register in AuthPage
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
    setActiveSessionId(null);
    setIsMobileMenuOpen(false);
  };

  const handleTutorClick = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    if (currentUser) {
      setPreviousView(view);
      setView('tutor-profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPendingAction('view-profile');
      setView('login');
    }
  };

  const handleSmartMatchFound = (ids: string[], reasoning: string) => {
    setSmartMatchIds(ids);
    setSmartMatchReasoning(reasoning);
    setIsSmartMatchActive(true);
    setView('find-tutor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSmartMatch = () => {
    setIsSmartMatchActive(false);
    setSmartMatchIds([]);
    setSmartMatchReasoning('');
  };

  // Chat Logic
  const handleStartChat = (targetId: string) => {
    if (!currentUser) {
      setPendingAction('find-tutor'); // or handle redirect
      setView('login');
      return;
    }

    // Check if session exists (optimistic check)
    let session = chatSessions.find(s => s.participantIds.includes(currentUser.id) && s.participantIds.includes(targetId));

    if (session) {
      // Mark as read when opening
      if (session.unreadCount > 0) {
        setChatSessions(prev => prev.map(s => s.id === session!.id ? { ...s, unreadCount: 0 } : s));
      }
      setActiveSessionId(session.id);
      setPreviousView(view);
      setView('chat');
      return;
    }

    // Create new session safely
    const newSessionId = `chat-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      participantIds: [currentUser.id, targetId],
      messages: [],
      lastMessagePreview: '',
      updatedAt: new Date(),
      unreadCount: 0
    };

    setChatSessions(prev => {
      // Double check inside setter to prevent race conditions
      const existing = prev.find(s => s.participantIds.includes(currentUser.id) && s.participantIds.includes(targetId));
      if (existing) return prev;
      return [...prev, newSession];
    });

    // We set active session ID optimistically to the new ID. 
    // In a race case where existing was found, the user might land on empty chat until they re-select, 
    // but preventing duplicates is more important.
    setActiveSessionId(newSessionId);
    setPreviousView(view);
    setView('chat');
  };

  // Handle selecting a session from the list (marks as read)
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, unreadCount: 0 } : s));
  };

  const handleSendMessage = (sessionId: string, text: string) => {
    if (!currentUser) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text: text,
      timestamp: new Date()
    };

    setChatSessions(prevSessions => prevSessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: [...s.messages, newMessage],
          lastMessagePreview: text,
          updatedAt: new Date(),
          // Note: If we were simulating receiving a message here, we would increment unreadCount if activeSessionId !== sessionId
        };
      }
      return s;
    }));
  };

  // Admin Actions & Others (Simplified for XML brevity as they are unchanged)
  const handleAdminApproveTutor = (id: string) => {
    setTutors(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    // Remove from students list if they were a student migrating to tutor
    setStudents(prev => prev.filter(s => s.id !== id));
  };
  const handleAdminRejectTutor = (id: string) => { setTutors(tutors.map(t => t.id === id ? { ...t, status: 'rejected' } : t)); };
  const handleAdminVerifyTutor = (id: string) => { setTutors(tutors.map(t => t.id === id ? { ...t, isVerified: !t.isVerified } : t)); };
  const handleAdminUpdateTutor = (updatedTutor: Tutor) => { setTutors(tutors.map(t => t.id === updatedTutor.id ? updatedTutor : t)); };
  const handleAdminMatchStudent = (requestId: string, tutorId?: string) => {
    setStudentRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        if (!tutorId) {
          // If specifically unassigning or clearing (tutorId undefined), maybe we should clear? 
          // But existing code used it for unassign. Let's assume undefined means reset for now or handle removal separately.
          // Actually, usually this is called with a specific ID to assign.
          return { ...req, status: 'pending', assignedTutorId: undefined, assignedTutorIds: [] };
        }

        const currentIds = req.assignedTutorIds || (req.assignedTutorId ? [req.assignedTutorId] : []);
        const newIds = currentIds.includes(tutorId) ? currentIds : [...currentIds, tutorId];

        return {
          ...req,
          status: 'matched',
          assignedTutorId: tutorId, // Keep latest as primary for compatibility
          assignedTutorIds: newIds
        };
      }
      return req;
    }));

    if (tutorId) {
      const request = studentRequests.find(r => r.id === requestId);
      if (request) {
        setTutors(prev => prev.map(t => {
          if (t.id === tutorId) {
            const current = t.assignedStudents || [];
            // Prevent duplicates
            if (current.some(s => s.studentId === request.studentId)) return t;
            return { ...t, assignedStudents: [...current, { studentId: request.studentId, studentName: request.studentName, requestId: request.id }] };
          }
          return t;
        }));

        // Create/Check Chat Session
        setChatSessions(prev => {
          // Check if session already exists
          const existingSession = prev.find(s =>
            (s.participantIds.includes(request.studentId) && s.participantIds.includes(tutorId))
          );

          if (existingSession) return prev;

          // Create new session
          const newSessionId = `chat-${Date.now()}`;
          const newSession: ChatSession = {
            id: newSessionId,
            participantIds: [request.studentId, tutorId],
            messages: [{
              id: `msg-sys-${Date.now()}`,
              senderId: ADMIN_ID,
              text: `Match Confirmed! You can now discuss class details.`,
              timestamp: new Date()
            }],
            lastMessagePreview: `Match Confirmed! You can now discuss class details.`,
            updatedAt: new Date(),
            unreadCount: 1
          };
          return [newSession, ...prev];
        });
      }
    }
  };
  const handleAdminActionStudent = (id: string, action: 'activate' | 'suspend') => { setStudents(prev => prev.map(s => s.id === id ? { ...s, status: action === 'activate' ? 'active' : 'suspended' } : s)); };
  const handleAdminReviewAction = (id: string, action: 'approve' | 'reject' | 'delete') => { if (action === 'delete') { setPlatformReviews(prev => prev.filter(r => r.id !== id)); } else { setPlatformReviews(prev => prev.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r)); } };
  const handleAdminUpdateStudent = (updatedStudent: User) => { setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s)); };
  const handleAdminApproveRequest = (requestId: string) => {
    setStudentRequests(prev => prev.map(req => req.id === requestId ? { ...req, isApproved: true } : req));
  };
  const handleAdminRemoveApprovalRequest = (requestId: string) => {
    setStudentRequests(prev => prev.map(req => req.id === requestId ? { ...req, isApproved: false } : req));
  };
  const handleAdminUpdateStudentRequest = (updatedRequest: StudentRequest) => {
    setStudentRequests(prev => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
  };
  const handleTutorUpdateProfile = (updatedTutor: Tutor) => { setTutors(tutors.map(t => t.id === updatedTutor.id ? updatedTutor : t)); };
  const handleTutorContactAdmin = () => { handleStartChat(ADMIN_ID); };
  const handleStudentUpdateProfile = (updatedUser: User) => { setStudents(students.map(s => s.id === updatedUser.id ? updatedUser : s)); setCurrentUser(updatedUser); };
  const handleStudentSubmitFeedback = (rating: number, content: string) => { const newReview: PlatformReview = { id: `rev-${Date.now()}`, studentId: currentUser?.id || 'anon', name: currentUser?.name || 'Anonymous', role: 'Student', image: currentUser?.avatar || 'https://ui-avatars.com/api/?name=Anon', content: content, rating: rating, status: 'pending', date: new Date().toISOString() }; setPlatformReviews([newReview, ...platformReviews]); };
  const handleTutorSubmitFeedback = (rating: number, content: string) => { const newReview: PlatformReview = { id: `rev-t-${Date.now()}`, studentId: currentUser?.id || 'anon-tutor', name: currentUser?.name || 'Anonymous Tutor', role: 'Tutor', image: currentUser?.avatar || 'https://ui-avatars.com/api/?name=Tutor', content: content, rating: rating, status: 'pending', date: new Date().toISOString() }; setPlatformReviews([newReview, ...platformReviews]); };
  const handleAddTutorReview = (review: Review) => { if (!selectedTutor) return; const updatedTutors = tutors.map(t => { if (t.id === selectedTutor.id) { const newReviewsList = [review, ...t.reviewsList]; const total = newReviewsList.reduce((acc, r) => acc + r.rating, 0); const avg = newReviewsList.length > 0 ? Number((total / newReviewsList.length).toFixed(1)) : 0; return { ...t, reviewsList: newReviewsList, rating: avg, reviews: newReviewsList.length }; } return t; }); setTutors(updatedTutors); const updatedSelectedTutor = updatedTutors.find(t => t.id === selectedTutor.id); if (updatedSelectedTutor) setSelectedTutor(updatedSelectedTutor); if (review.rating >= 4) { const platformReview: PlatformReview = { id: `pr-tutor-${Date.now()}`, studentId: currentUser?.id || 'guest', name: review.studentName, role: 'Student', image: currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.studentName)}&background=random`, content: `[Review for ${selectedTutor.name}] ${review.comment}`, rating: review.rating, status: 'approved', date: new Date().toISOString() }; setPlatformReviews(prev => [platformReview, ...prev]); } };
  const handleBecomeTutorSubmit = (tutorData: any) => { const existingTutorIds = tutors.map(t => t.id).filter(id => id.startsWith('T-') && !isNaN(Number(id.split('-')[1]))); let nextTutorNum = 1; if (existingTutorIds.length > 0) { const maxId = Math.max(...existingTutorIds.map(id => parseInt(id.split('-')[1], 10))); nextTutorNum = maxId + 1; } const nextTutorId = `T-${nextTutorNum.toString().padStart(3, '0')}`; const idToUse = currentUser ? currentUser.id : nextTutorId; const newTutor: Tutor = { ...tutorData, id: idToUse, status: 'pending' }; setTutors(prev => { const index = prev.findIndex(t => t.id === idToUse); if (index !== -1) { const updated = [...prev]; updated[index] = newTutor; return updated; } return [...prev, newTutor]; }); if (currentUser) { const updatedUser = { ...currentUser, role: 'tutor' as const }; setCurrentUser(updatedUser); setStudents(students.map(s => s.id === currentUser.id ? updatedUser : s)); setTimeout(() => setView('tutor-dashboard'), 100); } };
  const handleWizardComplete = (data: any) => { const newRequest: StudentRequest = { id: `req-${Date.now()}`, studentId: currentUser?.id || 'guest', studentName: currentUser?.name || 'Guest Student', avatar: currentUser?.avatar || 'https://ui-avatars.com/api/?name=Guest', subject: data.subject, level: data.level, mode: data.mode === 'online' ? 'online' : 'offline', location: data.location, description: `Looking for ${data.type} tutor for ${data.subject}.`, budget: parseInt(data.budget) || 0, postedAt: new Date(), status: 'pending', isApproved: false }; setStudentRequests([newRequest, ...studentRequests]); setIsWizardOpen(false); setShowRequestSuccess(true); if (currentUser?.role === 'student') { setView('student-dashboard'); } };

  const handleStudentDeleteRequest = (requestId: string) => {
    setStudentRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleTutorBookingRequest = (tutorId: string) => {
    const tutor = tutors.find(t => t.id === tutorId);
    if (!tutor) return;

    const newRequest: StudentRequest = {
      id: `req-${Date.now()}`,
      studentId: currentUser?.id || 'guest',
      studentName: currentUser?.name || 'Guest Student',
      avatar: currentUser?.avatar || 'https://ui-avatars.com/api/?name=Guest',
      subject: tutor.subjects[0] || 'General',
      level: 'All Levels',
      mode: tutor.classMode === 'both' ? 'online' : tutor.classMode,
      location: tutor.city,
      description: `Direct Booking Request for ${tutor.name}`,
      budget: tutor.hourlyRate,
      postedAt: new Date(),
      status: 'pending',
      preferredTutorId: tutor.id,
      preferredTutorName: tutor.name
    };

    setStudentRequests([newRequest, ...studentRequests]);
    setShowBookingSuccess(true);
  };


  // Featured Tutors Logic (Top rated & verified)
  const featuredTutors = tutors
    .filter(t => t.isVerified && t.rating >= 4.5 && t.status === 'approved')
    .slice(0, 4);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      <Analytics />

      {/* Modals & Nav (Unchanged from original) */}
      <SmartMatchModal isOpen={isSmartMatchOpen} onClose={() => setIsSmartMatchOpen(false)} onMatchesFound={handleSmartMatchFound} tutors={tutors} />
      <StudentRequestWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} onComplete={handleWizardComplete} />

      {/* Booking Success Modal */}
      {showBookingSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Sent!</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Your booking request has been sent to our Admin team for approval. We will notify you once the tutor confirms.
            </p>
            <button
              onClick={() => setShowBookingSuccess(false)}
              className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Okay, got it
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showRequestSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Received!</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Our team has received your request. An admin will review it and find the perfect tutor match for you shortly.
            </p>
            <button
              onClick={() => setShowRequestSuccess(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 dark:hover:shadow-none hover:-translate-y-0.5"
            >
              Awesome, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      {view !== 'login' && view !== 'chat' && (
        <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('home')}>
                <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">FindATeacher</span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <button onClick={() => setView('home')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'home' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Home</button>
                <button onClick={() => { setView('find-tutor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'find-tutor' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Find Tutors</button>
                <button onClick={() => handleAuthAction(() => setView('find-students'), 'find-students')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'find-students' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Student Requests</button>
              </div>
              <div className="flex items-center gap-3">
                {!currentUser && <button onClick={toggleTheme} className="hidden md:block p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>}
                {currentUser ? (
                  <div className="flex items-center gap-3">
                    <button onClick={() => { if (currentUser.role === 'admin') setView('admin-dashboard'); else if (currentUser.role === 'tutor') setView('tutor-dashboard'); else setView('student-dashboard'); }} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"><LayoutDashboard className="w-4 h-4" /> Dashboard</button>
                    <button onClick={() => setView('chat')} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors relative">
                      <MessageCircle className="w-5 h-5" />
                      {totalUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border border-white dark:border-slate-900 animate-pulse">
                          {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                      <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
                      <button onClick={handleLogout} className="hidden md:block p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout"><LogOut className="w-5 h-5" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setView('login')} className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors">Log in</button>
                    <button onClick={() => handleAuthAction(() => setView('become-tutor'), 'become-tutor')} className="hidden sm:flex px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">Become a Tutor</button>
                  </div>
                )}
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
              </div>
            </div>
          </div>
          {isMobileMenuOpen && (<div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200 shadow-xl"> <div className="px-4 pt-4 pb-4 space-y-2"> {currentUser && (<div className="flex items-center gap-3 px-3 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 border border-slate-100 dark:border-slate-700"> <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600" /> <div className="flex flex-col"> <span className="font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</span> <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium capitalize">{currentUser.role}</span> </div> </div>)} <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition-colors">Home</button> <button onClick={() => { setView('find-tutor'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition-colors">Find Tutors</button> <button onClick={() => { handleAuthAction(() => setView('find-students'), 'find-students'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition-colors">Student Requests</button> {currentUser && (<> <button onClick={() => { if (currentUser.role === 'admin') setView('admin-dashboard'); else if (currentUser.role === 'tutor') setView('tutor-dashboard'); else setView('student-dashboard'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">Dashboard</button> <button onClick={() => { setView('chat'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center justify-between"> <span>Messages</span> {totalUnreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnreadCount > 9 ? '9+' : totalUnreadCount}</span>} </button> </>)} <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2"> {!currentUser && (<button onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"> {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span> </button>)} {currentUser ? (<button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"> <LogOut className="w-5 h-5" /> <span>Logout</span> </button>) : (<> <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Log in</button> <button onClick={() => { handleAuthAction(() => setView('become-tutor'), 'become-tutor'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-indigo-600 dark:text-indigo-400 font-bold">Become a Tutor</button> </>)} </div> </div> </div>)}
        </nav>
      )}

      {/* Main Content Render */}
      <div className="flex-1">

        {view === 'home' && (
          <main>
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-900">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-32 relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                  <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 animate-in slide-in-from-bottom-5 duration-500">
                    Master any subject with <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                      Expert Tutors
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed animate-in slide-in-from-bottom-6 duration-700 delay-100">
                    Learn smarter with personalized 1-on-1 tutoring from verified mentors. From academics and competitive exams to skills and hobbies, connect with expert educators, IITians, and NITians who guide you with clarity and real-world insights.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-7 duration-700 delay-200">
                    <button
                      onClick={() => { setView('find-tutor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-full hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-5 h-5" /> Find a Tutor
                    </button>
                    <button
                      onClick={() => handleAuthAction(() => setIsWizardOpen(true), 'wizard')}
                      className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-lg font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Sparkles className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" /> Help Me Choose
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400 animate-in fade-in duration-1000 delay-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" /> Verified Tutors
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" /> Secure Payments
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" /> Satisfaction Guarantee
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">10k+</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Active Tutors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">50k+</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Students Taught</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">100+</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Subjects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">4.9/5</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Average Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURED TUTORS SECTION */}
            <div className="py-16 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Featured Tutors</h2>
                  <p className="text-slate-600 dark:text-slate-400">Top-rated instructors ready to help you excel.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                  {tutors.filter(t => t.status === 'approved').slice(0, 8).map((tutor, index) => (
                    <div
                      key={tutor.id}
                      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all group
                          ${index >= 4 && index < 6 ? 'hidden md:block' : ''}
                          ${index >= 6 ? 'hidden lg:block' : ''}
                        `}
                    >
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <img src={tutor.avatar} alt={tutor.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700" />
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{tutor.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span>{tutor.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {tutor.subjects.slice(0, 2).map(s => (
                              <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">{tutor.bio}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">₹{tutor.hourlyRate}/hr</span>
                          <button onClick={() => handleTutorClick(tutor)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View Profile</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => { setView('find-tutor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    Read More Tutors
                  </button>
                </div>
              </div>
            </div>

            {/* LATEST STUDENT REQUESTS SECTION */}
            <div className="py-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Latest Student Requests</h2>
                  <p className="text-slate-600 dark:text-slate-400">Students actively looking for tutors right now.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                  {studentRequests
                    .filter(r => r.isApproved)
                    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
                    .slice(0, 4)
                    .map((req, index) => (
                      <div
                        key={req.id}
                        className={`bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all
                          ${index === 3 ? 'block md:hidden lg:block' : ''}
                        `}
                      >
                        <div className="p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <img src={req.avatar} alt={req.studentName} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{req.subject}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{req.level}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${req.mode === 'online' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                              {req.mode === 'online' ? <Monitor className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                              {req.mode === 'online' ? 'Online' : req.location}
                            </span>
                          </div>

                          <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 mb-3 italic">
                            "{req.description}"
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 mb-2">
                            <span className="font-bold text-green-600 dark:text-green-400 text-sm">₹{req.budget}/hr</span>
                            <span className="text-[10px] text-slate-400">{new Date(req.postedAt).toLocaleDateString()}</span>
                          </div>

                          <div className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                            <Shield className="w-3 h-3" />
                            Assignment by Admin Only
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => handleAuthAction(() => setView('find-students'), 'find-students')}
                    className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Read More Requests
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION: Featured Tutors (New) - HIDDEN
            <div className="bg-slate-50 dark:bg-slate-900 py-16 border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" /> Featured Tutors
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">Learn from our highest-rated verified experts.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredTutors.map((tutor) => (
                    <div key={tutor.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all group cursor-pointer" onClick={() => handleTutorClick(tutor)}>
                      <div className="p-5 flex flex-col items-center text-center">
                        <div className="relative mb-3">
                          <img src={tutor.avatar} alt={tutor.name} className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 dark:border-slate-700" />
                          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1">
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                          </div>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-indigo-600 transition-colors">{tutor.name}</h3>
                        <div className="flex items-center justify-center gap-1 text-sm text-yellow-500 font-medium mb-3">
                          <Star className="w-4 h-4 fill-yellow-500" /> {tutor.rating}
                        </div>
                        <div className="flex flex-wrap justify-center gap-1 mb-4">
                          {tutor.subjects.slice(0, 2).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full">{s}</span>
                          ))}
                        </div>
                        <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-900 dark:text-white">₹{tutor.hourlyRate}/hr</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">View Profile</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <button
                    onClick={() => { setView('find-tutor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    View All Tutors
                  </button>
                </div>
              </div>
            </div>
            */}

            {/* SECTION: Student Feedback Carousel */}
            <div className="bg-slate-50 dark:bg-slate-900 py-16 overflow-hidden border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <Quote className="w-8 h-8 text-indigo-500" /> Students Love Learning Here
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Hear from students who achieved their goals.</p>
              </div>

              <div className="relative flex overflow-x-hidden group">
                <div className="animate-scroll flex gap-6 px-6">
                  {[...studentReviews, ...studentReviews].map((review, idx) => (
                    <div key={`${review.id}-${idx}-student`} className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 mb-4">
                        <img src={review.image} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{review.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              Student
                            </span>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm italic line-clamp-4">
                        "{review.content}"
                      </p>
                    </div>
                  ))}
                  {studentReviews.length === 0 && (
                    <div className="w-full text-center text-slate-500 py-4">No student reviews yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Tutor Feedback Carousel */}
            <div className="bg-white dark:bg-slate-950 py-16 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <Heart className="w-8 h-8 text-pink-500" /> Tutors Love Our Platform
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Join a community that supports your teaching journey.</p>
              </div>

              <div className="relative flex overflow-x-hidden group">
                {/* Reverse animation direction for visual variety could be cool, but standard scroll for now */}
                <div className="animate-scroll flex gap-6 px-6">
                  {[...tutorReviews, ...tutorReviews].map((review, idx) => (
                    <div key={`${review.id}-${idx}-tutor`} className="flex-shrink-0 w-80 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3 mb-4">
                        <img src={review.image} alt={review.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{review.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              Tutor
                            </span>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm italic line-clamp-4">
                        "{review.content}"
                      </p>
                    </div>
                  ))}
                  {tutorReviews.length === 0 && (
                    <div className="w-full text-center text-slate-500 py-4">No tutor reviews yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* NEW SECTION: We Provided Service (Combined Info Sections) */}
            <div className="py-16 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">We Provided Service</h2>
                  <p className="text-slate-600 dark:text-slate-400">Comprehensive educational support across subjects, grades, and locations.</p>
                </div>

                <div className="space-y-8">
                  {/* Subjects */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Subjects We Cover
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {COVERED_SUBJECTS.map(subject => (
                        <span key={subject} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-default">
                          {subject}
                        </span>
                      ))}
                      <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm font-medium">+6 more</span>
                    </div>
                  </div>

                  {/* Classes */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Classes We Cover
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {COVERED_CLASSES.map(cls => (
                        <span key={cls} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-default">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cities */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Cities We Serve
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {COVERED_CITIES.map(city => (
                        <span key={city} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-default">
                          {city}
                        </span>
                      ))}
                      <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm font-medium">+20 more</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="bg-indigo-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start learning?</h2>
                  <p className="text-indigo-100 text-lg mb-8">
                    Join thousands of students who are achieving their goals with personal tutoring.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={() => { setView('find-tutor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-full hover:bg-indigo-50 transition-colors"
                    >
                      Find a Tutor Now
                    </button>
                    {!currentUser && (
                      <button
                        onClick={() => handleAuthAction(() => setView('become-tutor'), 'become-tutor')}
                        className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors"
                      >
                        Teach on Platform
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ... (rest of the view rendering logic for other views like find-tutor, etc) ... */}
        {view === 'find-tutor' && (
          // ... existing find-tutor render ...
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500">
            {/* Header / Search Bar */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

                <button
                  onClick={() => setView('home')}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors font-medium text-sm group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </button>

                {isSmartMatchActive && smartMatchIds.length > 0 && (
                  <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">AI Recommended Matches</h3>
                      <p className="text-sm text-indigo-800 dark:text-indigo-400 mt-1">{smartMatchReasoning}</p>
                    </div>
                    <button onClick={clearSmartMatch} className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by subject, name, or keywords..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Primary Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white min-w-[140px]"
                    >
                      <option value="">All Subjects</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white min-w-[140px]"
                    >
                      <option value="">All Levels</option>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>

                    <button
                      onClick={() => handleAuthAction(() => setIsSmartMatchOpen(true), 'smart-match')}
                      className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4" /> Smart Match
                    </button>

                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className={`px-4 py-3 border rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${showAdvancedFilters ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white'}`}
                    >
                      <Filter className="w-4 h-4" /> Filters
                    </button>
                  </div>
                </div>

                {/* Advanced Filters Panel */}
                {showAdvancedFilters && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Class Mode</label>
                      <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                        {['all', 'online', 'offline'].map(m => (
                          <button
                            key={m}
                            onClick={() => setSelectedMode(m)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-colors ${selectedMode === m ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="e.g. New York"
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Price Range (₹/hr)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Min Rating</label>
                      <select
                        value={minRating}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      >
                        <option value="0">Any Rating</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                        <option value="5">5 Stars</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutors.map((tutor) => (
                  <div key={tutor.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group overflow-hidden flex flex-col">
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img src={tutor.avatar} alt={tutor.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700" />
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => handleTutorClick(tutor)}>
                              {tutor.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                              <span className="font-medium text-slate-900 dark:text-white">{tutor.rating}</span>
                              <span>({tutor.reviews})</span>
                            </div>
                          </div>
                        </div>
                        {tutor.isVerified && (
                          <div className="text-blue-500" title="Verified Tutor">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {tutor.subjects.slice(0, 3).map(sub => (
                            <span key={sub} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-md">
                              {sub}
                            </span>
                          ))}
                          {tutor.subjects.length > 3 && (
                            <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs rounded-md">+{tutor.subjects.length - 3}</span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{tutor.bio}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {tutor.experienceYears} Yrs Exp.
                        </div>
                        <div className="flex items-center gap-1">
                          {tutor.classMode === 'online' ? <Monitor className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                          <span className="capitalize">{tutor.classMode === 'both' ? 'Online & Offline' : tutor.classMode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">₹{tutor.hourlyRate}</span>
                        <span className="text-xs text-slate-500">/hr</span>
                      </div>
                      <button
                        onClick={() => handleTutorClick(tutor)}
                        className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors group-hover:border-indigo-200 group-hover:text-indigo-600"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTutors.length === 0 && (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">No tutors found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your filters or search terms.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSubject('');
                      setSelectedLevel('');
                      setSelectedCity('');
                      setSelectedMode('all');
                      setSmartMatchIds([]);
                      setIsSmartMatchActive(false);
                    }}
                    className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </main>
          </div>
        )}

        {view === 'tutor-profile' && selectedTutor && (
          <TutorProfile
            tutor={selectedTutor}
            onBack={() => setView(previousView || 'find-tutor')}
            onStartChat={() => handleStartChat(selectedTutor.id)}
            onBookLesson={handleTutorBookingRequest}
            onAddReview={handleAddTutorReview}
            currentUser={currentUser}
          />
        )}

        {view === 'become-tutor' && (
          <BecomeTutor
            onBack={() => setView('home')}
            onSubmitApplication={handleBecomeTutorSubmit}
            currentUser={currentUser}
          />
        )}

        {view === 'login' && (
          <AuthPage
            onLogin={handleLogin}
            onNavigateHome={() => setView('home')}
            existingUsers={[...students, ...tutors.map(t => ({ ...t, role: 'tutor' } as User))]} // Rough merge for checking duplicates
            onRegister={handleRegister}
          />
        )}

        {view === 'admin-dashboard' && currentUser?.role === 'admin' && (
          <AdminDashboard
            tutors={tutors}
            students={students}
            studentRequests={studentRequests}
            platformReviews={platformReviews}
            onApprove={handleAdminApproveTutor}
            onReject={handleAdminRejectTutor}
            onVerify={handleAdminVerifyTutor}
            onUpdate={handleAdminUpdateTutor}
            onMatchStudent={handleAdminMatchStudent}
            onActionStudent={handleAdminActionStudent}
            onReviewAction={handleAdminReviewAction}
            onUpdateStudent={handleAdminUpdateStudent}
            onApproveRequest={handleAdminApproveRequest}
            onRemoveApprovalRequest={handleAdminRemoveApprovalRequest}
            onUpdateRequest={handleAdminUpdateStudentRequest}
            onDeleteRequest={handleStudentDeleteRequest}
            toggleTheme={toggleTheme}
            darkMode={darkMode}
          />
        )}

        {view === 'chat' && (
          <ChatWindow
            currentUser={currentUser!}
            activeSessionId={activeSessionId}
            sessions={chatSessions.filter(s => currentUser?.isAdmin || s.participantIds.includes(currentUser!.id))} // Filter sessions logic
            tutors={tutors}
            students={students}
            onSelectSession={handleSelectSession}
            onSendMessage={handleSendMessage}
            onBack={() => setView(previousView === 'chat' ? 'home' : previousView)}
          />
        )}

        {view === 'tutor-dashboard' && currentUser?.role === 'tutor' && (
          <TutorDashboard
            currentUser={currentUser}
            tutorProfile={tutors.find(t => t.email === currentUser.email) || MOCK_TUTORS[0]} // Fallback if finding fails
            chatSessions={chatSessions}
            students={students}
            onUpdateProfile={handleTutorUpdateProfile}
            onNavigateChat={() => setView('chat')}
            onContactAdmin={handleTutorContactAdmin}
            onSubmitFeedback={handleTutorSubmitFeedback}
            toggleTheme={toggleTheme}
            darkMode={darkMode}
          />
        )}

        {view === 'student-dashboard' && currentUser?.role === 'student' && (
          <StudentDashboard
            currentUser={currentUser}
            chatSessions={chatSessions}
            onUpdateUser={handleStudentUpdateProfile}
            onNavigateChat={() => setView('chat')}
            onContactAdmin={handleTutorContactAdmin}
            onBecomeTutor={() => setView('become-tutor')}
            onSubmitFeedback={handleStudentSubmitFeedback}
            myRequests={studentRequests.filter(req => req.studentId === currentUser.id)}
            onDeleteRequest={handleStudentDeleteRequest}
            toggleTheme={toggleTheme}
            darkMode={darkMode}
          />
        )}

        {view === 'find-students' && (
          <StudentRequestsBoard
            requests={studentRequests}
            featuredTutors={featuredTutors}
            currentUserRole={currentUser?.role}
            onBack={() => setView('home')}
          />
        )}

        {view === 'about' && (
          <AboutPage onBack={() => setView('home')} />
        )}

      </div>

      {/* Footer Section */}
      {view !== 'chat' && view !== 'login' && view !== 'admin-dashboard' && (
        <footer className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pt-16 pb-8 relative border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

              {/* Column 1: Brand & Description */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  <span className="text-indigo-600 dark:text-indigo-400">Let’s</span> Work Together
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Welcome to our diverse and dynamic course catalog. At <span className="text-slate-900 dark:text-white font-semibold">FindATeacher</span>, we're dedicated to providing you with access to high-quality education that empowers your personal and professional growth.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Column 2: Navigation */}
              <div>
                <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Navigation</h3>
                <ul className="space-y-4 text-slate-600 dark:text-slate-400">
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setView('about'); window.scrollTo(0, 0); }}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      About
                    </a>
                  </li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Tutor Reviews</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQs</a></li>
                  <li>
                    <button
                      onClick={() => handleAuthAction(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), null)}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
                    >
                      Contact Us
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 3: Contact Us */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Contact Us</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">+91 8228866326</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">tutornearby.help@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">Park Street, Kolkata,</p>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">West Bengal-700017</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
              <p>Copyright © 2026 <span className="text-indigo-600 dark:text-indigo-400">FindATeacher</span> All Rights Reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms & Conditions</a>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>
          </div>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
            <a href="#" className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <MessageCircle className="w-8 h-8 fill-current" />
            </a>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg border border-slate-700 hover:bg-slate-700 transition-colors self-end"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </footer>
      )}

      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border-l-4 border-indigo-600 animate-in slide-in-from-right duration-500 max-w-sm z-50">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Find your perfect tutor!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try our AI Smart Match to find the best tutor for your specific needs in seconds.
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => {
                    if (currentUser) {
                      setIsWizardOpen(true);
                    } else {
                      handleAuthAction(() => setIsWizardOpen(true), 'wizard');
                    }
                    setShowNotification(false);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Help Me Choose
                </button>
                <button
                  onClick={() => {
                    if (currentUser) {
                      setIsSmartMatchOpen(true);
                    } else {
                      handleAuthAction(() => setIsSmartMatchOpen(true), 'smart-match');
                    }
                    setShowNotification(false);
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 text-xs font-bold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  Try Smart Match
                </button>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}