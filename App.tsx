import React, { useState, useMemo, useEffect } from 'react';
import { Search, GraduationCap, Users, ArrowRight, ArrowLeft, Star, Clock, CheckCircle2, BookOpen, Sparkles, Filter, LogOut, User as UserIcon, Shield, MessageCircle, LayoutDashboard, Sun, Moon, MapPin, Monitor, Building2, Quote, TrendingUp, Globe, Music, Briefcase, Bell, DollarSign, X, Check, Mail, Phone, Lock, ChevronRight, Home, Menu, Heart, Facebook, Twitter, Instagram, Linkedin, ArrowUp, AlertCircle, Info } from 'lucide-react';
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
import { apiService } from './services/apiService';

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
  const [view, setView] = useState<ViewState>(() => {
    const savedUser = localStorage.getItem('findatutor_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
          return 'admin-dashboard';
        }
      } catch (e) {
        console.error(e);
      }
    }
    return 'home';
  });
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

  // Toast Notification State
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, title, message, type });
  };

  // Pending Actions (e.g. open wizard after login)
  const [pendingAction, setPendingAction] = useState<'wizard' | 'become-tutor' | 'find-tutor' | 'find-students' | 'smart-match' | 'view-profile' | null>(null);

  // Data State
  const [tutors, setTutors] = useState<Tutor[]>(MOCK_TUTORS);
  const [students, setStudents] = useState<User[]>(MOCK_USERS);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>(MOCK_REQUESTS);
  const [platformReviews, setPlatformReviews] = useState<PlatformReview[]>(INITIAL_REVIEWS);
  
  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('findatutor_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error(e);
        return null;
      }
    }
    return null;
  });
  
  // Tutor Selection State
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  
  // Smart match state
  const [smartMatchIds, setSmartMatchIds] = useState<string[]>([]);
  const [smartMatchReasoning, setSmartMatchReasoning] = useState<string>('');
  const [isSmartMatchActive, setIsSmartMatchActive] = useState(false);

  // Chat State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Calculate Total Unread Messages
  const totalUnreadCount = useMemo(() => {
    return chatSessions.reduce((acc, session) => acc + (session.unreadCount || 0), 0);
  }, [chatSessions]);

  // Load initial data from the backend when app mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [loadedTutors, loadedStudents, loadedRequests, loadedReviews] = await Promise.all([
          apiService.tutors.getAll(),
          apiService.students.getAll(),
          apiService.requests.getAll(),
          apiService.reviews.getAll()
        ]);
        setTutors(loadedTutors);
        setStudents(loadedStudents);
        setStudentRequests(loadedRequests);
        setPlatformReviews(loadedReviews);
      } catch (err) {
        console.error("Error fetching initial data from backend:", err);
      }
    };
    fetchInitialData();
  }, []);

  // Load user-specific chats from the backend when user logs in and poll every 4 seconds
  useEffect(() => {
    if (!currentUser) {
      setChatSessions([]);
      return;
    }
    const fetchUserChats = async () => {
      try {
        const loadedChats = await apiService.chats.getAll(currentUser.id);
        setChatSessions(prev => {
          // Avoid unnecessary rerenders if the data hasn't changed
          if (JSON.stringify(prev) === JSON.stringify(loadedChats)) {
            return prev;
          }
          return loadedChats;
        });
      } catch (err) {
        console.error("Error fetching chat sessions:", err);
      }
    };

    fetchUserChats();
    const interval = setInterval(fetchUserChats, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Sync user session to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('findatutor_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('findatutor_user');
    }
  }, [currentUser]);

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

  // Auto-dismiss toast
  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  // Helper to check if a student and tutor are matched
  const isMatched = (studentId: string, tutorId: string) => {
    return studentRequests.some(req => 
      req.studentId === studentId && 
      req.assignedTutorId === tutorId && 
      req.status === 'matched'
    );
  };

  // Filtered sessions visible to the logged-in user
  const filteredChatSessionsForUser = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return chatSessions;

    return chatSessions.filter(session => {
      // Must be a participant
      if (!session.participantIds.includes(currentUser.id)) return false;

      // Check if it's a student-tutor direct chat
      const otherParticipantId = session.participantIds.find(id => id !== currentUser.id);
      if (otherParticipantId && otherParticipantId !== ADMIN_ID) {
        const isCurrentTutor = currentUser.role === 'tutor';
        const isCurrentStudent = currentUser.role === 'student';
        
        const otherIsTutor = tutors.some(t => t.id === otherParticipantId);
        const otherIsStudent = students.some(s => s.id === otherParticipantId);

        if ((isCurrentStudent && otherIsTutor) || (isCurrentTutor && otherIsStudent)) {
          const studentId = isCurrentStudent ? currentUser.id : otherParticipantId;
          const tutorId = isCurrentTutor ? currentUser.id : otherParticipantId;

          // Hide this session unless they are matched by the Admin
          return isMatched(studentId, tutorId);
        }
      }

      return true;
    });
  }, [chatSessions, currentUser, studentRequests, tutors, students]);

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

  const sendAdminLogMessage = async (userId: string, userName: string, action: 'Login' | 'Logout') => {
    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateString = timestamp.toLocaleDateString();
    const logText = `System Alert: User ${userName} (${userId}) performed ${action} at ${timeString} on ${dateString}.`;

    try {
      const updatedSession = await apiService.chats.sendSystemLog(userId, logText);
      setChatSessions(prevSessions => {
        const idx = prevSessions.findIndex(s => s.id === updatedSession.id);
        if (idx > -1) {
          const updated = [...prevSessions];
          updated[idx] = updatedSession;
          return updated;
        }
        return [...prevSessions, updatedSession];
      });
    } catch (err) {
      console.error("Failed to send system log message to backend:", err);
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

    // Log student/tutor login to admin
    if (authenticatedUser.role === 'student' || authenticatedUser.role === 'tutor') {
      sendAdminLogMessage(authenticatedUser.id, authenticatedUser.name, 'Login');

      // Trigger individual toast notification for login
      showToast(
        `Welcome back, ${authenticatedUser.name}!`,
        `You have successfully logged in as a ${authenticatedUser.role === 'student' ? 'Student' : 'Tutor'}.`,
        'success'
      );
    }

    // Handle Pending Actions after Login
    if (pendingAction === 'wizard') {
        if (authenticatedUser.role === 'student') {
             // Delay slightly to allow UI transition
             setTimeout(() => setIsWizardOpen(true), 100);
        } else {
             showToast('Student Feature', 'The request wizard is optimized for students.', 'info');
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
    if (currentUser && (currentUser.role === 'student' || currentUser.role === 'tutor')) {
      sendAdminLogMessage(currentUser.id, currentUser.name, 'Logout');
    }
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

    // Check permission for student-tutor chat
    const isCurrentTutor = currentUser.role === 'tutor';
    const isCurrentStudent = currentUser.role === 'student';
    const targetIsTutor = tutors.some(t => t.id === targetId);
    const targetIsStudent = students.some(s => s.id === targetId);

    if ((isCurrentStudent && targetIsTutor) || (isCurrentTutor && targetIsStudent)) {
      const studentId = isCurrentStudent ? currentUser.id : targetId;
      const tutorId = isCurrentTutor ? currentUser.id : targetId;

      if (!isMatched(studentId, tutorId)) {
        showToast('Chat Locked', 'You cannot message this user directly. You must be matched by the Admin first.', 'error');
        return;
      }
    }

    // Check if session exists
    let session = chatSessions.find(s => s.participantIds.includes(currentUser.id) && s.participantIds.includes(targetId));

    if (!session) {
        // Create new session
        const newSession: ChatSession = {
            id: `chat-${Date.now()}`,
            participantIds: [currentUser.id, targetId],
            messages: [],
            lastMessagePreview: '',
            updatedAt: new Date(),
            unreadCount: 0
        };
        setChatSessions([...chatSessions, newSession]);
        session = newSession;
    }

    // Mark as read when opening
    if (session.unreadCount > 0) {
        setChatSessions(prev => prev.map(s => s.id === session!.id ? { ...s, unreadCount: 0 } : s));
    }

    setActiveSessionId(session.id);
    setPreviousView(view);
    setView('chat');
  };

  const handleBookTutor = async (tutorId: string) => {
    if (!currentUser) {
      setPendingAction('find-tutor');
      setView('login');
      return;
    }

    if (currentUser.role !== 'student') {
      showToast('Error', 'Only students can request a tutor.', 'error');
      return;
    }

    const alreadyRequested = studentRequests.some(r => 
      r.studentId === currentUser.id && 
      r.assignedTutorId === tutorId && 
      (r.status === 'pending' || r.status === 'matched')
    );

    if (alreadyRequested) {
      showToast('Info', 'You have already requested this tutor or are already matched.', 'info');
      return;
    }

    const tutor = tutors.find(t => t.id === tutorId);
    if (!tutor) return;

    const newRequestData: Partial<StudentRequest> = {
      id: `req-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      avatar: currentUser.avatar,
      subject: tutor.subjects[0] || 'General Tutoring',
      level: currentUser.grade || 'Class X',
      mode: tutor.classMode,
      location: tutor.city,
      description: `Request for 1-on-1 lessons with tutor: ${tutor.name}.`,
      budget: 0,
      postedAt: new Date(),
      status: 'pending',
      assignedTutorId: tutorId
    };

    try {
      const savedRequest = await apiService.requests.create(newRequestData);
      setStudentRequests(prev => [savedRequest, ...prev]);
      showToast('Success', `Your request to book ${tutor.name} has been sent. Pending Admin approval.`, 'success');
    } catch (err) {
      console.error("Error booking tutor:", err);
      showToast('Error', 'Failed to send booking request.', 'error');
    }
  };

  const handleSelectSession = async (sessionId: string) => {
      setActiveSessionId(sessionId);
      setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, unreadCount: 0 } : s));
      try {
          await apiService.chats.markAsRead(sessionId);
      } catch (err) {
          console.error("Error marking session as read:", err);
      }
  };

  const handleSendMessage = async (sessionId: string, text: string) => {
    if (!currentUser) return;

    // Create optimistic message to update UI instantly
    const optimisticMessage = {
      id: `optimistic-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      senderId: currentUser.id,
      text: text,
      timestamp: new Date()
    };

    // Save current sessions to roll back on failure
    const originalSessions = [...chatSessions];

    // Optimistically update state
    setChatSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: [...s.messages, optimisticMessage],
          lastMessagePreview: text,
          updatedAt: new Date()
        };
      }
      return s;
    }));

    try {
      const updatedSession = await apiService.chats.sendMessage(sessionId, currentUser.id, text, activeSessionId);
      setChatSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
    } catch (err) {
      console.error("Error sending message:", err);
      setChatSessions(originalSessions);
      showToast("Error", "Failed to send message. Please check your connection.", "error");
    }
  };

  const handleAdminApproveTutor = async (id: string) => {
    try {
      const updatedTutor = await apiService.tutors.updateStatus(id, 'approved');
      setTutors(prev => prev.map(t => t.id === id ? updatedTutor : t));
    } catch (err) {
      console.error("Error approving tutor:", err);
    }
  };

  const handleAdminRejectTutor = async (id: string) => {
    try {
      const updatedTutor = await apiService.tutors.updateStatus(id, 'rejected');
      setTutors(prev => prev.map(t => t.id === id ? updatedTutor : t));
    } catch (err) {
      console.error("Error rejecting tutor:", err);
    }
  };

  const handleAdminVerifyTutor = async (id: string) => {
    const tutor = tutors.find(t => t.id === id);
    if (!tutor) return;
    try {
      const updatedTutor = await apiService.tutors.verify(id, !tutor.isVerified);
      setTutors(prev => prev.map(t => t.id === id ? updatedTutor : t));
    } catch (err) {
      console.error("Error verifying tutor:", err);
    }
  };

  const handleAdminUpdateTutor = async (updatedTutor: Tutor) => {
    try {
      const savedTutor = await apiService.tutors.update(updatedTutor.id, updatedTutor);
      setTutors(prev => prev.map(t => t.id === updatedTutor.id ? savedTutor : t));
    } catch (err) {
      console.error("Error updating tutor:", err);
    }
  };

  const handleAdminMatchStudent = async (requestId: string, tutorId?: string) => {
    if (!tutorId) return;
    try {
      if (requestId.startsWith('direct-assign:')) {
        const studentId = requestId.substring('direct-assign:'.length);
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const newRequestData: Partial<StudentRequest> = {
          id: `req-auto-${Date.now()}`,
          studentId: student.id,
          studentName: student.name,
          avatar: student.avatar,
          subject: 'General Tutoring',
          level: 'Secondary',
          mode: 'both',
          location: 'Anywhere',
          description: 'Assigned directly by Admin.',
          budget: 0,
          postedAt: new Date(),
          status: 'pending'
        };

        const createdRequest = await apiService.requests.create(newRequestData);
        setStudentRequests(prev => [createdRequest, ...prev]);

        const { request, chatSession } = await apiService.requests.matchRequest(createdRequest.id, tutorId);
        setStudentRequests(prev => prev.map(r => r.id === createdRequest.id ? request : r));
        setChatSessions(prev => {
          const idx = prev.findIndex(s => s.id === chatSession.id);
          if (idx > -1) {
            const updated = [...prev];
            updated[idx] = chatSession;
            return updated;
          }
          return [...prev, chatSession];
        });
      } else {
        const { request, chatSession } = await apiService.requests.matchRequest(requestId, tutorId);
        setStudentRequests(prev => prev.map(r => r.id === requestId ? request : r));
        setChatSessions(prev => {
          const idx = prev.findIndex(s => s.id === chatSession.id);
          if (idx > -1) {
            const updated = [...prev];
            updated[idx] = chatSession;
            return updated;
          }
          return [...prev, chatSession];
        });
      }
      showToast("Tutor Matched", "Student and tutor linked successfully. Chat is now active.", "success");
    } catch (err) {
      console.error("Match student error:", err);
      showToast("Matching Failed", "Could not complete student-tutor match.", "error");
    }
  };

  const handleAdminActionStudent = async (id: string, action: 'activate' | 'suspend') => {
    try {
      const updatedUser = await apiService.students.updateProfile(id, { status: action === 'activate' ? 'active' : 'suspended' });
      setStudents(prev => prev.map(s => s.id === id ? updatedUser : s));
    } catch (err) {
      console.error("Error updating student status:", err);
    }
  };

  const handleAdminReviewAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      const res = await apiService.reviews.updateStatus(id, action);
      if (action === 'delete') {
        setPlatformReviews(prev => prev.filter(r => r.id !== id));
      } else {
        setPlatformReviews(prev => prev.map(r => r.id === id ? res : r));
      }
    } catch (err) {
      console.error("Error updating review status:", err);
    }
  };

  const handleAdminUpdateStudent = async (updatedStudent: User) => {
    try {
      const savedStudent = await apiService.students.updateProfile(updatedStudent.id, updatedStudent);
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? savedStudent : s));
    } catch (err) {
      console.error("Error updating student:", err);
    }
  };

  const handleTutorUpdateProfile = handleAdminUpdateTutor;
  const handleTutorContactAdmin = () => { handleStartChat(ADMIN_ID); };
  const handleStudentUpdateProfile = async (updatedUser: User) => {
    try {
      const savedStudent = await apiService.students.updateProfile(updatedUser.id, updatedUser);
      setStudents(prev => prev.map(s => s.id === updatedUser.id ? savedStudent : s));
      setCurrentUser(savedStudent);
    } catch (err) {
      console.error("Error updating student profile:", err);
    }
  };

  const handleStudentSubmitFeedback = async (rating: number, content: string) => {
    const newReview: Partial<PlatformReview> = {
      id: `rev-${Date.now()}`,
      studentId: currentUser?.id || 'anon',
      name: currentUser?.name || 'Anonymous',
      role: 'Student',
      image: currentUser?.avatar || 'https://ui-avatars.com/api/?name=Anon',
      content: content,
      rating: rating,
      status: 'pending',
      date: new Date().toISOString()
    };
    try {
      const savedReview = await apiService.reviews.create(newReview);
      setPlatformReviews(prev => [savedReview, ...prev]);
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  const handleTutorSubmitFeedback = async (rating: number, content: string) => {
    const newReview: Partial<PlatformReview> = {
      id: `rev-t-${Date.now()}`,
      studentId: currentUser?.id || 'anon-tutor',
      name: currentUser?.name || 'Anonymous Tutor',
      role: 'Tutor',
      image: currentUser?.avatar || 'https://ui-avatars.com/api/?name=Tutor',
      content: content,
      rating: rating,
      status: 'pending',
      date: new Date().toISOString()
    };
    try {
      const savedReview = await apiService.reviews.create(newReview);
      setPlatformReviews(prev => [savedReview, ...prev]);
    } catch (err) {
      console.error("Error submitting tutor feedback:", err);
    }
  };

  const handleAddTutorReview = async (review: Review) => {
    if (!selectedTutor) return;
    try {
      const updatedTutor = await apiService.tutors.addReview(selectedTutor.id, review);
      setTutors(prev => prev.map(t => t.id === selectedTutor.id ? updatedTutor : t));
      setSelectedTutor(updatedTutor);
      if (review.rating >= 4) {
        const platformReview: Partial<PlatformReview> = {
          id: `pr-tutor-${Date.now()}`,
          studentId: currentUser?.id || 'guest',
          name: review.studentName,
          role: 'Student',
          image: currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.studentName)}&background=random`,
          content: `[Review for ${selectedTutor.name}] ${review.comment}`,
          rating: review.rating,
          status: 'approved',
          date: new Date().toISOString()
        };
        const savedReview = await apiService.reviews.create(platformReview);
        setPlatformReviews(prev => [savedReview, ...prev]);
      }
    } catch (err) {
      console.error("Error adding review:", err);
    }
  };

  const handleBecomeTutorSubmit = async (tutorData: any) => {
    const existingTutorIds = tutors.map(t => t.id).filter(id => id.startsWith('T-') && !isNaN(Number(id.split('-')[1])));
    let nextTutorNum = 1;
    if (existingTutorIds.length > 0) {
      const maxId = Math.max(...existingTutorIds.map(id => parseInt(id.split('-')[1], 10)));
      nextTutorNum = maxId + 1;
    }
    const nextTutorId = `T-${nextTutorNum.toString().padStart(3, '0')}`;
    const idToUse = currentUser ? currentUser.id : nextTutorId;
    const newTutor: Tutor = { ...tutorData, id: idToUse, status: 'pending' };

    try {
      const savedTutor = await apiService.tutors.update(idToUse, newTutor);
      setTutors(prev => {
        const index = prev.findIndex(t => t.id === idToUse);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = savedTutor;
          return updated;
        }
        return [...prev, savedTutor];
      });

      if (currentUser) {
        const updatedUser = await apiService.students.updateProfile(currentUser.id, { role: 'tutor' });
        setCurrentUser(updatedUser);
        setStudents(students.map(s => s.id === currentUser.id ? updatedUser : s));
        setTimeout(() => setView('tutor-dashboard'), 100);
      }
    } catch (err) {
      console.error("Error upgrading user to tutor:", err);
    }
  };

  const handleWizardComplete = async (data: any) => {
    const newRequestData: Partial<StudentRequest> = {
      id: `req-${Date.now()}`,
      studentId: currentUser?.id || 'guest',
      studentName: currentUser?.name || 'Guest Student',
      avatar: currentUser?.avatar || 'https://ui-avatars.com/api/?name=Guest',
      subject: data.subject,
      level: data.level,
      mode: data.mode === 'online' ? 'online' : 'offline',
      location: data.location,
      description: `Looking for ${data.type} tutor for ${data.subject}.`,
      budget: 0,
      postedAt: new Date(),
      status: 'pending'
    };

    try {
      const savedRequest = await apiService.requests.create(newRequestData);
      setStudentRequests(prev => [savedRequest, ...prev]);
      setIsWizardOpen(false);
      showToast(
        'Request Submitted',
        'Request sent to our team! An Admin will review your request and match you with a tutor soon.',
        'success'
      );
      if (currentUser?.role === 'student') {
        setView('student-dashboard');
      }
    } catch (err) {
      console.error("Error completing wizard request:", err);
      showToast('Error', 'Failed to submit request.', 'error');
    }
  };


  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* Modals & Nav (Unchanged from original) */}
      <SmartMatchModal isOpen={isSmartMatchOpen} onClose={() => setIsSmartMatchOpen(false)} onMatchesFound={handleSmartMatchFound} tutors={tutors} />
      <StudentRequestWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} onComplete={handleWizardComplete} />

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
                <button onClick={() => setView('find-tutor')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'find-tutor' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Find Tutors</button>
                <button onClick={() => handleAuthAction(() => setView('find-students'), 'find-students')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'find-students' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Student Requests</button>
                <button onClick={() => setView('about')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'about' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>About</button>
              </div>
              <div className="flex items-center gap-3">
                {!currentUser && <button onClick={toggleTheme} className="hidden md:block p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>}
                {currentUser ? (
                  <div className="flex items-center gap-3">
                    <button onClick={() => { if (currentUser.role === 'admin') setView('admin-dashboard'); else if (currentUser.role === 'tutor') setView('tutor-dashboard'); else setView('student-dashboard'); }} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"><LayoutDashboard className="w-4 h-4" /> Dashboard</button>
                    <button onClick={() => setView('chat')} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors relative"><MessageCircle className="w-5 h-5" />{totalUnreadCount > 0 && (<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>)}</button>
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                       <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
                       <button onClick={handleLogout} className="hidden md:block p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout"><LogOut className="w-5 h-5" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setView('login')} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">Log in</button>
                  </div>
                )}
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
              </div>
            </div>
          </div>
          {isMobileMenuOpen && (
             <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200 shadow-xl">
                <div className="px-4 pt-4 pb-4 space-y-2">
                   {currentUser && (
                      <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 border border-slate-100 dark:border-slate-700">
                         <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600" />
                         <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</span>
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium capitalize">{currentUser.role}</span>
                         </div>
                      </div>
                   )}
                   <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition-colors">Home</button>
                   <button onClick={() => { setView('find-tutor'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition-colors">Find Tutors</button>
                   <button onClick={() => { handleAuthAction(() => setView('find-students'), 'find-students'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition-colors">Student Requests</button>
                   <button onClick={() => { setView('about'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition-colors">About</button>
                   {currentUser && (
                      <>
                         <button onClick={() => { if (currentUser.role === 'admin') setView('admin-dashboard'); else if (currentUser.role === 'tutor') setView('tutor-dashboard'); else setView('student-dashboard'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">Dashboard</button>
                         <button onClick={() => { setView('chat'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center justify-between">
                            <span>Messages</span>
                            {totalUnreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnreadCount}</span>}
                         </button>
                      </>
                   )}
                   <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
                      {!currentUser && (
                         <button onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                         </button>
                      )}
                      {currentUser ? (
                         <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                         </button>
                      ) : (
                         <>
                            <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Log in</button>
                         </>
                      )}
                   </div>
                </div>
             </div>
          )}
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
                          Connect with verified tutors for 1-on-1 learning. From school subjects to hobbies, find the perfect mentor to guide your journey.
                       </p>
                       
                       <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-7 duration-700 delay-200">
                          <button 
                             onClick={() => handleAuthAction(() => setView('find-tutor'), 'find-tutor')}
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
                        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full
                          ${index >= 4 && index < 6 ? 'hidden md:block' : ''}
                          ${index >= 6 ? 'hidden lg:block' : ''}
                        `}
                      >
                         <div className="p-5 flex flex-col h-full justify-between">
                            <div>
                               <div className="flex items-center gap-3 mb-3">
                                  <div className="relative flex-shrink-0">
                                     <img src={tutor.avatar} alt={tutor.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" />
                                     {tutor.isVerified && (
                                        <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 border border-white dark:border-slate-800 shadow-sm flex items-center justify-center">
                                           <Check className="w-2.5 h-2.5 stroke-[3]" />
                                        </span>
                                     )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                     <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{tutor.name}</h3>
                                     <div className="flex items-center gap-1 mt-0.5">
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{tutor.rating.toFixed(1)}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">({tutor.reviewsList?.length || tutor.reviews || 0})</span>
                                     </div>
                                  </div>
                               </div>
                               <div className="mb-4">
                                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                                     {tutor.subjects.slice(0, 2).map(s => (
                                        <span key={s} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold rounded-md">
                                           {s}
                                        </span>
                                     ))}
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">{tutor.bio}</p>
                               </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                               <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="text-xs truncate max-w-[100px]">{tutor.city}</span>
                               </div>
                               <button 
                                 onClick={() => handleTutorClick(tutor)} 
                                 className="inline-flex items-center gap-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                               >
                                 <span>View Profile</span>
                                 <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                     <button 
                       onClick={() => handleAuthAction(() => setView('find-tutor'), 'find-tutor')}
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
                    {studentRequests.filter(r => r.status === 'pending').slice(0, 4).map((req, index) => (
                      <div 
                        key={req.id} 
                        className={`bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full
                          ${index === 3 ? 'block md:hidden lg:block' : ''}
                        `}
                      >
                         <div className="p-5 flex flex-col h-full justify-between">
                            <div>
                               <div className="flex items-start gap-3 mb-3">
                                  <img src={req.avatar} alt={req.studentName} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800" />
                                  <div className="min-w-0 flex-1">
                                     <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{req.subject}</h3>
                                     <p className="text-xs text-slate-500 dark:text-slate-400">{req.level}</p>
                                  </div>
                               </div>
                               
                               <div className="flex flex-wrap gap-2 mb-3">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                     req.mode === 'online' 
                                       ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30' 
                                       : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100/50 dark:border-emerald-900/30'
                                  }`}>
                                     {req.mode === 'online' ? <Monitor className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                     {req.mode === 'online' ? 'Online' : req.location}
                                  </span>
                                </div>

                               <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-3 mb-4 italic leading-relaxed">
                                  "{req.description}"
                               </p>
                            </div>
                            
                            <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                               <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  Requested by <span className="font-semibold text-slate-800 dark:text-slate-200">{req.studentName}</span>
                               </div>
                               <div className="flex items-center justify-between text-[10px] text-slate-400">
                                  <span className="flex items-center gap-1">
                                     <Clock className="w-3.5 h-3.5" />
                                     {new Date(req.postedAt).toLocaleDateString()}
                                  </span>
                               </div>
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
                            onClick={() => handleAuthAction(() => setView('find-tutor'), 'find-tutor')}
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
                  <div key={tutor.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full">
                     <div className="p-6 flex flex-col h-full justify-between">
                        <div>
                           <div className="flex items-center gap-3 mb-4">
                              <div className="relative flex-shrink-0">
                                 <img src={tutor.avatar} alt={tutor.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" />
                                 {tutor.isVerified && (
                                    <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 border border-white dark:border-slate-800 shadow-sm flex items-center justify-center">
                                       <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </span>
                                 )}
                              </div>
                              <div className="min-w-0 flex-1">
                                 <h3 className="font-bold text-slate-900 dark:text-white text-base truncate hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => handleTutorClick(tutor)}>
                                    {tutor.name}
                                 </h3>
                                 <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{tutor.rating.toFixed(1)}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">({tutor.reviewsList?.length || tutor.reviews || 0})</span>
                                 </div>
                              </div>
                           </div>

                           <div className="mb-4">
                              <div className="flex flex-wrap gap-1.5 mb-2.5">
                                 {tutor.subjects.slice(0, 3).map(sub => (
                                    <span key={sub} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold rounded-md">
                                       {sub}
                                    </span>
                                 ))}
                                 {tutor.subjects.length > 3 && (
                                    <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-[10px] font-semibold rounded-md">+{tutor.subjects.length - 3}</span>
                                 )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">{tutor.bio}</p>
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

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                           <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-xs truncate max-w-[120px]">{tutor.city}</span>
                           </div>
                           <button 
                             onClick={() => handleTutorClick(tutor)}
                             className="inline-flex items-center gap-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                           >
                             <span>View Profile</span>
                             <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                           </button>
                        </div>
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
            onBookLesson={handleBookTutor}
            onAddReview={handleAddTutorReview}
            currentUser={currentUser}
            showToast={showToast}
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
             existingUsers={[...students, ...tutors.map(t => ({...t, role: 'tutor'} as User))]} // Rough merge for checking duplicates
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
              toggleTheme={toggleTheme}
              darkMode={darkMode}
              showToast={showToast}
           />
        )}

        {view === 'chat' && (
           <ChatWindow 
              currentUser={currentUser!}
              activeSessionId={activeSessionId}
              sessions={filteredChatSessionsForUser}
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
              toggleTheme={toggleTheme}
              darkMode={darkMode}
           />
        )}
        
        {view === 'find-students' && (
            <StudentRequestsBoard 
                requests={studentRequests} 
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
                    onClick={(e) => { e.preventDefault(); setView('about'); window.scrollTo(0,0); }} 
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
                  <div className="flex gap-2 mt-3">
                     <button 
                       onClick={() => { 
                          if (currentUser) {
                             setIsSmartMatchOpen(true); 
                          } else {
                             handleAuthAction(() => setIsSmartMatchOpen(true), 'smart-match');
                          }
                          setShowNotification(false); 
                       }}
                       className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                     >
                        Try Smart Match
                     </button>
                     <button 
                       onClick={() => setShowNotification(false)}
                       className="text-xs text-slate-400 hover:text-slate-600"
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

      {/* Toast Notification */}
      {toast && toast.show && (
         <div className={`fixed bottom-4 left-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border-l-4 animate-in slide-in-from-left duration-500 max-w-sm z-50 transition-all ${
            toast.type === 'error' ? 'border-red-500' :
            toast.type === 'success' ? 'border-green-500' :
            'border-blue-500'
         }`}>
            <div className="flex items-start gap-3">
               <div className={`p-2 rounded-full ${
                  toast.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  toast.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
               }`}>
                  {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                   toast.type === 'success' ? <Check className="w-5 h-5" /> :
                   <Info className="w-5 h-5" />}
               </div>
               <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{toast.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                     {toast.message}
                  </p>
               </div>
               <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-4 h-4" />
               </button>
            </div>
         </div>
      )}

    </div>
  );
}