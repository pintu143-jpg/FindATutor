
import { Tutor, StudentRequest, User } from './types';

export const ADMIN_ID = 'admin-system-user';

export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'English Literature', 'Spanish', 'French', 'History', 
  'Computer Science', 'Piano', 'Guitar', 'Art'
];

export const LEVELS = [
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
  'University', 'Adult'
];

export const MOCK_USERS: User[] = [
  {
    id: 'S-001',
    name: 'Alex Mitchell',
    email: 'alex.m@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Mitchell&background=random',
    role: 'student',
    status: 'active',
    phone: '+1 (555) 010-1010',
    address: '123 Maple Avenue, New York, NY',
    gender: 'Male',
    schoolName: 'Lincoln High School',
    grade: 'Class XII',
    joinedAt: new Date('2023-01-15')
  },
  {
    id: 'S-002',
    name: 'Emma Watson',
    email: 'emma.w@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Emma+Watson&background=random',
    role: 'student',
    status: 'active',
    phone: '+1 (555) 020-2020',
    address: '456 Oak Lane, San Francisco, CA',
    gender: 'Female',
    schoolName: 'San Francisco Arts Academy',
    grade: 'Adult',
    joinedAt: new Date('2023-02-20')
  },
  {
    id: 'S-003',
    name: 'Liam Chen',
    email: 'liam.c@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Liam+Chen&background=random',
    role: 'student',
    status: 'pending',
    phone: '+1 (555) 030-3030',
    address: '789 Pine Street, Seattle, WA',
    gender: 'Male',
    schoolName: 'University of Washington',
    grade: 'University',
    joinedAt: new Date('2023-11-05')
  },
  {
    id: 'S-004',
    name: 'Sophia Rodriguez',
    email: 'sophia.r@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Sophia+Rodriguez&background=random',
    role: 'student',
    status: 'suspended',
    phone: '+1 (555) 040-4040',
    address: '321 Elm Dr, Austin, TX',
    gender: 'Female',
    schoolName: 'Austin International School',
    grade: 'Class X',
    joinedAt: new Date('2023-05-12')
  },
  {
    id: 'S-005',
    name: 'Noah Kim',
    email: 'noah.k@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Noah+Kim&background=random',
    role: 'student',
    status: 'active',
    phone: '+1 (555) 050-5050',
    address: '654 Cedar Blvd, Chicago, IL',
    gender: 'Male',
    schoolName: 'Northside College Prep',
    grade: 'Class XI',
    joinedAt: new Date('2023-09-01')
  }
];

export const MOCK_REQUESTS: StudentRequest[] = [
  {
    id: 'req1',
    studentId: 'S-001',
    studentName: 'Alex Mitchell',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Mitchell&background=random',
    subject: 'Physics',
    level: 'Class XII',
    mode: 'online',
    location: 'New York',
    description: 'Looking for a physics tutor to help with mechanics and thermodynamics for upcoming exams.',
    budget: 40,
    postedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    status: 'pending'
  },
  {
    id: 'req2',
    studentId: 'S-002',
    studentName: 'Emma Watson',
    avatar: 'https://ui-avatars.com/api/?name=Emma+Watson&background=random',
    subject: 'Piano',
    level: 'Beginner',
    mode: 'offline',
    location: 'San Francisco',
    description: 'Adult beginner looking for in-person piano lessons on weekends.',
    budget: 60,
    postedAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
    status: 'matched'
  },
  {
    id: 'req3',
    studentId: 'S-003',
    studentName: 'Liam Chen',
    avatar: 'https://ui-avatars.com/api/?name=Liam+Chen&background=random',
    subject: 'Computer Science',
    level: 'University',
    mode: 'online',
    location: 'Remote',
    description: 'Need help with Data Structures and Algorithms in Python.',
    budget: 50,
    postedAt: new Date(Date.now() - 3600000), // 1 hour ago
    status: 'pending'
  }
];

export const MOCK_TUTORS: Tutor[] = [
  {
    id: 'T-001',
    name: 'Sarah Jenkins',
    avatar: 'https://picsum.photos/seed/sarah/200/200',
    subjects: ['Mathematics', 'Physics', 'Calculus'],
    bio: 'PhD student in Physics with 5 years of tutoring experience. I specialize in making complex concepts easy to understand for high school and college students.',
    hourlyRate: 45,
    rating: 4.9,
    reviews: 124,
    experienceYears: 5,
    isVerified: true,
    availability: 'Weekdays 4PM-9PM',
    levels: ['Class XI', 'Class XII', 'University'],
    status: 'approved',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY',
    gender: 'Female',
    qualifications: 'PhD Candidate in Physics, BSc in Mathematics',
    resume: 'resume_sarah.pdf',
    classMode: 'both',
    city: 'New York',
    reviewsList: [
      {
        id: 'r1',
        studentName: 'Emily R.',
        rating: 5,
        comment: 'Sarah is incredible! She helped me finally understand Calculus. Highly recommend.',
        date: '2023-11-15'
      },
      {
        id: 'r2',
        studentName: 'Jason M.',
        rating: 5,
        comment: 'Very patient and explains things clearly. My grades improved significantly.',
        date: '2023-10-02'
      },
      {
        id: 'r3',
        studentName: 'Lisa K.',
        rating: 4,
        comment: 'Great tutor, but sometimes hard to schedule due to high demand.',
        date: '2023-09-20'
      }
    ]
  },
  {
    id: 'T-002',
    name: 'David Chen',
    avatar: 'https://picsum.photos/seed/david/200/200',
    subjects: ['English Literature', 'History', 'Essay Writing'],
    bio: 'High school teacher offering private lessons in literature and history. I can help with essay writing, critical analysis, and exam preparation.',
    hourlyRate: 30,
    rating: 4.7,
    reviews: 89,
    experienceYears: 8,
    isVerified: true,
    availability: 'Mon-Fri Afternoons',
    levels: ['Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
    status: 'approved',
    email: 'david.c@example.com',
    phone: '+1 (555) 987-6543',
    address: '456 Market St, San Francisco, CA',
    gender: 'Male',
    qualifications: 'MA in English Literature, BEd',
    resume: 'resume_david.pdf',
    classMode: 'offline',
    city: 'San Francisco',
    reviewsList: [
      {
        id: 'r1',
        studentName: 'Michael B.',
        rating: 5,
        comment: 'David helped me ace my history paper. His feedback on my essay was invaluable.',
        date: '2023-12-01'
      },
      {
        id: 'r2',
        studentName: 'Sarah L.',
        rating: 4,
        comment: 'Good knowledge of literature, very helpful for my AP English class.',
        date: '2023-11-10'
      }
    ]
  },
  {
    id: 'T-003',
    name: 'Emily Rodriguez',
    avatar: 'https://picsum.photos/seed/emily/200/200',
    subjects: ['Spanish', 'French'],
    bio: 'Native Spanish speaker and certified language instructor. I believe in immersive learning and conversation-based practice.',
    hourlyRate: 35,
    rating: 4.8,
    reviews: 56,
    experienceYears: 3,
    isVerified: true,
    availability: 'Flexible',
    levels: ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Adult'],
    status: 'approved',
    email: 'emily.r@example.com',
    phone: '+1 (555) 456-7890',
    address: '789 State St, Chicago, IL',
    gender: 'Female',
    qualifications: 'BA in Modern Languages',
    resume: 'resume_emily.pdf',
    classMode: 'online',
    city: 'Chicago',
    reviewsList: [
      {
        id: 'r1',
        studentName: 'Tom H.',
        rating: 5,
        comment: 'Fun and engaging lessons! I feel much more confident speaking Spanish now.',
        date: '2023-10-25'
      }
    ]
  },
  {
    id: 'T-004',
    name: 'Michael Ross',
    avatar: 'https://picsum.photos/seed/michael/200/200',
    subjects: ['Computer Science', 'Python', 'React', 'JavaScript'],
    bio: 'Senior Software Engineer helping students break into tech. I teach coding fundamentals, web development, and algorithm prep.',
    hourlyRate: 60,
    rating: 5.0,
    reviews: 42,
    experienceYears: 10,
    isVerified: true,
    availability: 'Weekends',
    levels: ['Class IX', 'Class X', 'Class XI', 'Class XII', 'University', 'Adult'],
    status: 'approved',
    email: 'mike.ross@example.com',
    phone: '+1 (555) 111-2222',
    address: '101 Tech Blvd, Austin, TX',
    gender: 'Male',
    qualifications: 'MSc in Computer Science',
    resume: 'resume_mike.pdf',
    classMode: 'online',
    city: 'Austin',
    reviewsList: [
      {
        id: 'r1',
        studentName: 'Alex P.',
        rating: 5,
        comment: 'Michael knows his stuff. He helped me prepare for my coding interviews perfectly.',
        date: '2024-01-10'
      },
      {
        id: 'r2',
        studentName: 'Jessica W.',
        rating: 5,
        comment: 'Best coding tutor I have found. Explains complex algorithms simply.',
        date: '2023-12-15'
      }
    ]
  },
  {
    id: 'T-005',
    name: 'Jessica Lee',
    avatar: 'https://picsum.photos/seed/jessica/200/200',
    subjects: ['Piano', 'Music Theory'],
    bio: 'Conservatory-trained pianist. I teach all ages, from beginners to advanced students preparing for recitals.',
    hourlyRate: 50,
    rating: 4.9,
    reviews: 78,
    experienceYears: 12,
    isVerified: false,
    availability: 'Tuesday & Thursday',
    levels: ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Adult'],
    status: 'approved',
    email: 'j.lee@example.com',
    phone: '+1 (555) 333-4444',
    address: '202 Music Ln, New York, NY',
    gender: 'Female',
    qualifications: 'BMus in Piano Performance',
    resume: 'resume_jessica.pdf',
    classMode: 'offline',
    city: 'New York',
    reviewsList: [
      {
        id: 'r1',
        studentName: 'Parent of Timmy',
        rating: 5,
        comment: 'My son loves his piano lessons with Jessica. She is so patient.',
        date: '2023-11-05'
      }
    ]
  },
  {
    id: 'T-006',
    name: 'Robert Wilson',
    avatar: 'https://picsum.photos/seed/robert/200/200',
    subjects: ['Chemistry', 'Biology'],
    bio: 'Retired science teacher passionate about helping students ace their AP and IB exams. Patient and detailed oriented.',
    hourlyRate: 40,
    rating: 4.6,
    reviews: 210,
    experienceYears: 25,
    isVerified: true,
    availability: 'Mornings & Afternoons',
    levels: ['Class IX', 'Class X', 'Class XI', 'Class XII'],
    status: 'approved',
    email: 'r.wilson@example.com',
    phone: '+1 (555) 555-5555',
    address: '303 Science Ct, Boston, MA',
    gender: 'Male',
    qualifications: 'MEd in Science Education',
    resume: 'resume_robert.pdf',
    classMode: 'both',
    city: 'Boston',
    reviewsList: [
      {
        id: 'r1',
        studentName: 'Chris D.',
        rating: 5,
        comment: 'Robert is a legend. He knows exactly what is on the AP exams.',
        date: '2023-05-10'
      },
      {
        id: 'r2',
        studentName: 'Ashley T.',
        rating: 4,
        comment: 'Very detailed explanations, sometimes goes a bit fast but knows his chemistry.',
        date: '2023-04-22'
      }
    ]
  },
  // Pending Tutors for Admin Panel Testing
  {
    id: 'T-007',
    name: 'Pending Paul',
    avatar: 'https://picsum.photos/seed/paul/200/200',
    subjects: ['Geography', 'History'],
    bio: 'Enthusiastic history major looking to tutor students in world geography and history.',
    hourlyRate: 25,
    rating: 0,
    reviews: 0,
    experienceYears: 1,
    isVerified: false,
    availability: 'Weekends only',
    levels: ['Class V', 'Class VI', 'Class VII'],
    status: 'pending',
    email: 'paul.pending@example.com',
    phone: '+1 (555) 777-8888',
    address: '404 History Rd, London, UK',
    gender: 'Male',
    qualifications: 'BA in History',
    resume: 'resume_paul.pdf',
    classMode: 'online',
    city: 'London',
    reviewsList: []
  },
  {
    id: 'T-008',
    name: 'Alice Applicant',
    avatar: 'https://picsum.photos/seed/alice/200/200',
    subjects: ['Art', 'Drawing'],
    bio: 'Professional artist offering private drawing lessons for beginners.',
    hourlyRate: 35,
    rating: 0,
    reviews: 0,
    experienceYears: 4,
    isVerified: false,
    availability: 'Flexible',
    levels: ['Class I', 'Class II', 'Adult'],
    status: 'pending',
    email: 'alice.art@example.com',
    phone: '+1 (555) 999-0000',
    address: '505 Art Ave, Seattle, WA',
    gender: 'Female',
    qualifications: 'BFA in Fine Arts',
    resume: 'resume_alice.pdf',
    classMode: 'offline',
    city: 'Seattle',
    reviewsList: []
  }
];
