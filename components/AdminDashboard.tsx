import React, { useState } from 'react';
import { CheckCircle2, XCircle, Shield, Search, Check, Mail, Edit, X, Save, Phone, FileText, Users, TrendingUp, BarChart3, AlertCircle, IndianRupee, Activity, Clock, BookOpen, MapPin, Monitor, Send, GraduationCap, List, Link as LinkIcon, UserPlus, UserMinus, ThumbsUp, Star, Quote, Building2, Briefcase, Trash2, Sun, Moon, Heart, User as UserIcon } from 'lucide-react';
import { Tutor, StudentRequest, User, PlatformReview } from '../types';
import UserDetailModal from './UserDetailModal';

interface AdminDashboardProps {
    tutors: Tutor[];
    students?: User[];
    studentRequests?: StudentRequest[];
    platformReviews?: PlatformReview[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onVerify: (id: string) => void;
    onUpdate: (tutor: Tutor) => void;
    onMatchStudent?: (requestId: string, tutorId?: string) => void;
    onActionStudent?: (id: string, action: 'activate' | 'suspend') => void;
    onReviewAction?: (id: string, action: 'approve' | 'reject' | 'delete') => void;
    onUpdateStudent?: (student: User) => void;
    onApproveRequest?: (requestId: string) => void;
    onRemoveApprovalRequest?: (requestId: string) => void;
    onUpdateRequest?: (request: StudentRequest) => void;
    onDeleteRequest?: (requestId: string) => void;
    toggleTheme?: () => void;
    darkMode?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    tutors,
    students = [],
    studentRequests = [],
    platformReviews = [],
    onApprove,
    onReject,
    onVerify,
    onUpdate,
    onMatchStudent,
    onActionStudent,
    onReviewAction,
    onUpdateStudent,
    onApproveRequest,
    onRemoveApprovalRequest,
    onUpdateRequest,
    onDeleteRequest,
    toggleTheme,
    darkMode
}) => {
    const [activeTab, setActiveTab] = useState<'tutors' | 'students' | 'requests' | 'feedback'>('tutors');
    const [studentView, setStudentView] = useState<'all' | 'active' | 'requests'>('all');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
    const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<'all' | 'Student' | 'Tutor'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Tutor Tab Assignment State
    const [assigningTutorId, setAssigningTutorId] = useState<string | null>(null);
    const [studentIdToAssign, setStudentIdToAssign] = useState('');

    // Request Tab Assignment State
    const [assigningRequestId, setAssigningRequestId] = useState<string | null>(null);
    const [tutorSearchForRequest, setTutorSearchForRequest] = useState('');

    const [editingRequest, setEditingRequest] = useState<StudentRequest | null>(null);
    const [requestSearchTerm, setRequestSearchTerm] = useState('');
    const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
    const [editingStudent, setEditingStudent] = useState<User | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | Tutor | null>(null);

    const filteredTutors = tutors.filter(tutor => {
        const matchesFilter = filter === 'all' ? true : tutor.status === filter;
        const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tutor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tutor.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (studentView === 'active') {
            return matchesSearch && (student.status === 'active' || !student.status);
        }
        return matchesSearch;
    });

    const pendingReviews = platformReviews.filter(r => r.status === 'pending');

    const historyReviews = platformReviews.filter(r => {
        const isNotPending = r.status !== 'pending';
        const matchesType = feedbackTypeFilter === 'all' ? true : r.role === feedbackTypeFilter;
        return isNotPending && matchesType;
    });

    // Filter requests
    const filteredRequestsList = studentRequests.filter(req => {
        const searchLower = requestSearchTerm.toLowerCase();
        return (
            req.studentName.toLowerCase().includes(searchLower) ||
            req.subject.toLowerCase().includes(searchLower) ||
            req.id.toLowerCase().includes(searchLower) ||
            (req.preferredTutorName && req.preferredTutorName.toLowerCase().includes(searchLower))
        );
    });

    // Tutor Stats
    const pendingTutorCount = tutors.filter(t => t.status === 'pending').length;
    const activeTutorCount = tutors.filter(t => t.status === 'approved').length;

    // Student Stats
    const totalStudentCount = students.length;
    const activeStudentCount = students.filter(s => s.status === 'active' || !s.status).length;
    const pendingStudentCount = students.filter(s => s.status === 'pending').length;
    const suspendedStudentCount = students.filter(s => s.status === 'suspended').length;

    const pendingRequestsCount = studentRequests.filter(req => req.status === 'pending').length;
    const pendingFeedbackCount = pendingReviews.length;

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTutor) {
            onUpdate(editingTutor);
            setEditingTutor(null);
        }
    };

    const handleSaveStudentEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStudent && onUpdateStudent) {
            onUpdateStudent(editingStudent);
            setEditingStudent(null);
        }
    };

    const handleTutorAssignStudent = (tutorId: string) => {
        if (!studentIdToAssign || !onMatchStudent) return;

        // Find the student request associated with this ID
        // Prioritize pending requests, then matched requests (to re-assign)
        const targetRequest = studentRequests.find(r => r.studentId === studentIdToAssign && (r.status === 'pending' || r.status === 'matched'));

        if (targetRequest) {
            onMatchStudent(targetRequest.id, tutorId);
            setAssigningTutorId(null);
            setStudentIdToAssign('');
        } else {
            alert(`No active or pending request found for Student ID: ${studentIdToAssign}`);
        }
    };

    const renderStats = () => {
        if (activeTab === 'students') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{totalStudentCount}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-sm text-green-600 dark:text-green-400 font-medium">
                            <TrendingUp className="w-4 h-4" />
                            <span>+8%</span>
                            <span className="text-slate-400 font-normal ml-1">new this week</span>
                        </div>
                    </div>

                    <div onClick={() => setActiveTab('requests')} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between cursor-pointer hover:border-indigo-500 transition-colors group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Students</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{activeStudentCount}</h3>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-sm text-green-600 dark:text-green-400 font-medium">
                            <span>95%</span>
                            <span className="text-slate-400 font-normal ml-1">engagement rate</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Requests</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{pendingRequestsCount}</h3>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <Send className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-xs text-slate-400">Requires matching</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Suspended Users</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{suspendedStudentCount}</h3>
                            </div>
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-sm text-red-600 dark:text-red-400 font-medium">
                            <span>Action Taken</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'feedback') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between relative overflow-hidden">
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Feedback</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{pendingFeedbackCount}</h3>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 relative z-10">
                            <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
                                Action Req.
                            </span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Published Feedback</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{platformReviews.filter(r => r.status === 'approved').length}</h3>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                                <ThumbsUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Default Tutor Stats
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tutors</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{tutors.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-sm text-green-600 dark:text-green-400 font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>+12%</span>
                        <span className="text-slate-400 font-normal ml-1">from last month</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Teachers</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{activeTutorCount}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-sm text-green-600 dark:text-green-400 font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>+5%</span>
                        <span className="text-slate-400 font-normal ml-1">from last month</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Approvals</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{pendingTutorCount}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
                            Action Req.
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Revenue (YTD)</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">₹45.2k</h3>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-sm text-green-600 dark:text-green-400 font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>+24%</span>
                        <span className="text-slate-400 font-normal ml-1">from last month</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500 font-sans">

            {/* Admin Header - Responsive */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:h-16 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">

                    <div className="w-full md:w-auto flex items-center justify-between">
                        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            Admin Console
                        </h1>
                        {/* Mobile-only avatar */}
                        <div className="flex md:hidden items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">A</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <nav className="flex flex-1 md:flex-none gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setActiveTab('tutors')}
                                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === 'tutors' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                            >
                                Tutors
                            </button>
                            <button
                                onClick={() => setActiveTab('students')}
                                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === 'students' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                            >
                                Students
                            </button>
                            <button
                                onClick={() => setActiveTab('feedback')}
                                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === 'feedback' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                            >
                                Feedback
                            </button>
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === 'requests' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                            >
                                Requests
                                {pendingRequestsCount > 0 && <span className="ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs px-1.5 py-0.5 rounded-full">{pendingRequestsCount}</span>}
                            </button>
                        </nav>

                        {/* Desktop Avatar */}
                        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Admin User</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">System Administrator</p>
                            </div>
                            <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-slate-700 shadow-sm">A</div>
                            {toggleTheme && (
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 ml-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* ... rest of the file ... */}

                {/* Stats Row */}
                {renderStats()}

                {/* ... Rest of the file unchanged ... */}

                {/* --- TUTORS TAB --- */}
                {activeTab === 'tutors' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                                {['pending', 'approved', 'all'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status as any)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize flex-1 sm:flex-none ${filter === status ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search tutors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-sm"
                                />
                            </div>
                        </div>

                        {/* Tutors Table */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                            <th className="p-4 font-semibold">Tutor</th>
                                            <th className="p-4 font-semibold hidden md:table-cell">Assigned Students</th>
                                            <th className="p-4 font-semibold">Subjects</th>
                                            <th className="p-4 font-semibold">Status</th>
                                            <th className="p-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {filteredTutors.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                                    No tutors found matching your criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTutors.map(tutor => (
                                                <tr
                                                    key={tutor.id}
                                                    onClick={() => setSelectedUser(tutor)}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <img src={tutor.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                                                                {tutor.isVerified && <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /></div>}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{tutor.name}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{tutor.email}</p>
                                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {tutor.id}</p>
                                                                <div className="md:hidden mt-2">
                                                                    {tutor.assignedStudents && tutor.assignedStudents.length > 0 && (
                                                                        <div className="flex flex-col gap-1">
                                                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Students:</p>
                                                                            {tutor.assignedStudents.map(student => (
                                                                                <div key={student.requestId} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs flex items-center justify-between">
                                                                                    <span>{student.studentName}</span>
                                                                                    <span className="opacity-70 text-[9px]">{student.studentId}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 hidden md:table-cell">
                                                        {tutor.assignedStudents && tutor.assignedStudents.length > 0 ? (
                                                            <div className="flex flex-col gap-1 max-w-[200px]">
                                                                {tutor.assignedStudents.map(student => (
                                                                    <div key={student.requestId} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs flex items-center justify-between group cursor-help" title={`Request ID: ${student.requestId}`}>
                                                                        <span className="truncate mr-1">{student.studentName}</span>
                                                                        <span className="font-mono text-[9px] opacity-70">{student.studentId}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">None</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {tutor.subjects.slice(0, 2).map(s => (
                                                                <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300">{s}</span>
                                                            ))}
                                                            {tutor.subjects.length > 2 && <span className="text-xs text-slate-400">+{tutor.subjects.length - 2}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${tutor.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            tutor.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            }`}>
                                                            {tutor.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            {tutor.status === 'pending' && (
                                                                <>
                                                                    <button onClick={(e) => { e.stopPropagation(); onApprove(tutor.id); }} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors" title="Approve">
                                                                        <Check className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={(e) => { e.stopPropagation(); onReject(tutor.id); }} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Reject">
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setEditingTutor(tutor); }}
                                                                className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>

                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- STUDENTS TAB --- */}
                {activeTab === 'students' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                                <button
                                    onClick={() => setStudentView('all')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 sm:flex-none ${studentView === 'all' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    All Students
                                </button>
                                <button
                                    onClick={() => setStudentView('active')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 sm:flex-none ${studentView === 'active' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    Active Only
                                </button>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                            <th className="p-4 font-semibold">Student</th>
                                            <th className="p-4 font-semibold">Contact</th>
                                            <th className="p-4 font-semibold">Status</th>
                                            <th className="p-4 font-semibold">Poster Request</th>
                                            <th className="p-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                                    No students found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStudents.map(student => {
                                                const request = studentRequests.find(r => r.studentId === student.id);
                                                return (
                                                    <tr
                                                        key={student.id}
                                                        onClick={() => setSelectedUser(student)}
                                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                                                    >
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <img src={student.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{student.name}</p>
                                                                    <p className="text-[10px] text-slate-400 font-mono">ID: {student.id}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="text-sm">
                                                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                                    <Mail className="w-3 h-3" /> {student.email}
                                                                </div>
                                                                {student.phone && (
                                                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-1">
                                                                        <Phone className="w-3 h-3" /> {student.phone}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${student.status === 'suspended' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                }`}>
                                                                {student.status || 'Active'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            {request ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-xs font-medium text-slate-900 dark:text-white max-w-[150px] truncate" title={request.subject}>{request.subject}</span>
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] w-fit ${request.isApproved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                        }`}>
                                                                        {request.isApproved ? 'Approved' : 'Hidden'}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">No request</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    onClick={() => setEditingStudent(student)}
                                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                                                                    title="Edit Details"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                {onActionStudent && (
                                                                    <button
                                                                        onClick={() => onActionStudent(student.id, student.status === 'suspended' ? 'activate' : 'suspend')}
                                                                        className={`p-1.5 rounded transition-colors ${student.status === 'suspended' ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                                                                        title={student.status === 'suspended' ? "Activate User" : "Suspend User"}
                                                                    >
                                                                        {student.status === 'suspended' ? <UserPlus className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                                                                    </button>
                                                                )}


                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })

                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- REQUESTS TAB --- */}
                {activeTab === 'requests' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Student Requests ({filteredRequestsList.length})
                            </h2>

                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    value={requestSearchTerm}
                                    onChange={(e) => setRequestSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                            <th className="p-4 font-semibold">Student</th>
                                            <th className="p-4 font-semibold">Subject / Level</th>
                                            <th className="p-4 font-semibold">Mode / Location</th>
                                            <th className="p-4 font-semibold">Posted</th>
                                            <th className="p-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {filteredRequestsList.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                                    No requests found matching your search.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRequestsList.map(req => (
                                                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                {req.avatar ? (
                                                                    <img src={req.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-slate-200 dark:border-slate-600">
                                                                        {req.studentName.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{req.studentName}</p>
                                                                <p className="text-[10px] text-slate-400 font-mono">ID: {req.studentId}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium text-slate-900 dark:text-white">{req.subject}</div>
                                                        <div className="text-xs text-slate-500">{req.level}</div>
                                                        {req.budget > 0 && (
                                                            <div className="text-xs text-green-600 font-medium mt-1">Budget: ₹{req.budget}/hr</div>
                                                        )}
                                                        {req.preferredTutorName && (
                                                            <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-medium border border-purple-100 dark:border-purple-800">
                                                                <Heart className="w-3 h-3 text-purple-600 dark:text-purple-400 fill-purple-600/20" /> Requested: {req.preferredTutorName}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${req.mode === 'online' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                                                                {req.mode === 'online' ? <Monitor className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                                                <span className="capitalize">{req.mode}</span>
                                                            </span>
                                                            {req.mode === 'offline' && (
                                                                <span className="text-xs text-slate-500">{req.location}</span>
                                                            )}
                                                            {(req.assignedTutorIds && req.assignedTutorIds.length > 0 ? req.assignedTutorIds : (req.assignedTutorId ? [req.assignedTutorId] : [])).map((tId, idx) => (
                                                                <div key={idx} className="mt-1 flex items-center gap-1 text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800">
                                                                    <UserIcon className="w-3 h-3" />
                                                                    <span className="font-semibold">Match: {tId}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-500">
                                                        {new Date(req.postedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="relative flex items-center justify-end">
                                                            {req.isApproved ? (
                                                                <button
                                                                    onClick={() => onRemoveApprovalRequest && onRemoveApprovalRequest(req.id)}
                                                                    className="mr-2 p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1.5"
                                                                    title="Revoke Approval (Hide)"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            ) : !req.preferredTutorId && ( // Hide Approve Posting if preferred tutor exists (direct request)
                                                                <button
                                                                    onClick={() => onApproveRequest && onApproveRequest(req.id)}
                                                                    className="mr-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
                                                                    title="Approve for public view"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" /> Approve Posting
                                                                </button>
                                                            )}
                                                            {req.preferredTutorId && (!req.assignedTutorIds?.includes(req.preferredTutorId) && req.assignedTutorId !== req.preferredTutorId) && (
                                                                <button
                                                                    onClick={() => onMatchStudent && onMatchStudent(req.id, req.preferredTutorId)}
                                                                    className="mr-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 transition-all flex items-center gap-1.5 border border-green-200 dark:border-green-800"
                                                                    title={`Approve match with ${req.preferredTutorName}`}
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Match
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => setAssigningRequestId(assigningRequestId === req.id ? null : req.id)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${assigningRequestId === req.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400'}`}
                                                            >
                                                                <LinkIcon className="w-3.5 h-3.5" /> {(req.assignedTutorIds?.length || req.assignedTutorId) ? 'Add Tutor' : (req.preferredTutorId ? 'Select Tutor' : 'Assign')}
                                                            </button>

                                                            <button
                                                                onClick={() => setEditingRequest(req)}
                                                                className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5"
                                                                title="Edit Request Content"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>

                                                            {assigningRequestId === req.id && (
                                                                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in zoom-in-95 duration-100">
                                                                    <div className="flex justify-between items-center mb-3">
                                                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Select Tutor</h4>
                                                                        <button onClick={() => setAssigningRequestId(null)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                                    </div>

                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search approved tutors..."
                                                                        value={tutorSearchForRequest}
                                                                        onChange={(e) => setTutorSearchForRequest(e.target.value)}
                                                                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg mb-3 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                                        autoFocus
                                                                    />

                                                                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                                        {tutors
                                                                            .filter(t => t.status === 'approved' && (t.name.toLowerCase().includes(tutorSearchForRequest.toLowerCase()) || t.subjects.some(s => s.toLowerCase().includes(tutorSearchForRequest.toLowerCase()))))
                                                                            .map(tutor => (
                                                                                <div key={tutor.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer group"
                                                                                    onClick={() => {
                                                                                        if (onMatchStudent) {
                                                                                            onMatchStudent(req.id, tutor.id);
                                                                                            setAssigningRequestId(null);
                                                                                        }
                                                                                    }}>
                                                                                    <img src={tutor.avatar} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600" />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{tutor.name}</p>
                                                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{tutor.subjects.join(', ')}</p>
                                                                                    </div>
                                                                                    <div className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Select</div>
                                                                                </div>
                                                                            ))}
                                                                        {tutors.filter(t => t.status === 'approved').length === 0 && (
                                                                            <p className="text-xs text-center text-slate-400 py-2">No approved tutors found.</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- FEEDBACK TAB --- */}
                {activeTab === 'feedback' && (
                    <div className="space-y-8">

                        {/* Pending Approval Section */}
                        {pendingReviews.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-amber-500" /> Pending Approval
                                </h3>
                                <div className="grid gap-4">
                                    {pendingReviews.map(review => (
                                        <div key={review.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <img src={review.image} className="w-8 h-8 rounded-full" />
                                                    <div>
                                                        <span className="font-bold text-slate-900 dark:text-white text-sm block">{review.name}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 block">{review.role} • ID: {review.studentId}</span>
                                                    </div>
                                                    <div className="flex ml-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm italic bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                                    "{review.content}"
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onReviewAction && onReviewAction(review.id, 'approve')}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <Check className="w-4 h-4" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => onReviewAction && onReviewAction(review.id, 'reject')}
                                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <X className="w-4 h-4" /> Reject
                                                </button>
                                                <button
                                                    onClick={() => onReviewAction && onReviewAction(review.id, 'delete')}
                                                    className="px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Delete permanently"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Feedback History */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Quote className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Feedback History
                                </h3>

                                {/* Feedback Type Filter */}
                                <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                                    {['all', 'Student', 'Tutor'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFeedbackTypeFilter(type as any)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize flex-1 sm:flex-none ${feedbackTypeFilter === type ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                            <th className="p-4 font-semibold">User</th>
                                            <th className="p-4 font-semibold">Role</th>
                                            <th className="p-4 font-semibold w-1/2">Content</th>
                                            <th className="p-4 font-semibold">Rating</th>
                                            <th className="p-4 font-semibold">Status</th>
                                            <th className="p-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {historyReviews.map(review => (
                                            <tr key={review.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <img src={review.image} className="w-6 h-6 rounded-full" />
                                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{review.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${review.role === 'Tutor' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                                        {review.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                                    "{review.content}"
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${review.status === 'approved' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'
                                                        }`}>
                                                        {review.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => onReviewAction && onReviewAction(review.id, 'delete')}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Remove Review"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {historyReviews.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-500">No feedback found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* Edit Tutor Modal */}
            {editingTutor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Tutor Profile</h3>
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editingTutor.name}
                                    onChange={e => setEditingTutor({ ...editingTutor, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subjects (comma separated)</label>
                                <input
                                    type="text"
                                    value={editingTutor.subjects.join(', ')}
                                    onChange={e => setEditingTutor({ ...editingTutor, subjects: e.target.value.split(',').map(s => s.trim()) })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setEditingTutor(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Student Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Student</h3>
                        <form onSubmit={handleSaveStudentEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editingStudent.name}
                                    onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editingStudent.email}
                                    onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={editingStudent.phone || ''}
                                    onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
            {/* Edit Request Modal */}
            {editingRequest && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit className="w-5 h-5 text-indigo-600" />
                                Edit Student Request
                            </h3>
                            <button onClick={() => setEditingRequest(null)} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={editingRequest.subject}
                                        onChange={(e) => setEditingRequest({ ...editingRequest, subject: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hourly Budget (₹)</label>
                                    <input
                                        type="number"
                                        value={editingRequest.budget}
                                        onChange={(e) => setEditingRequest({ ...editingRequest, budget: Number(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                                    value={editingRequest.description}
                                    onChange={(e) => setEditingRequest({ ...editingRequest, description: e.target.value })}
                                    placeholder="Improve the formatting and text..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={editingRequest.location}
                                        onChange={(e) => setEditingRequest({ ...editingRequest, location: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mode</label>
                                    <select
                                        value={editingRequest.mode}
                                        onChange={(e) => setEditingRequest({ ...editingRequest, mode: e.target.value as 'online' | 'offline' })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="online">Online</option>
                                        <option value="offline">Offline</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingRequest(null)}
                                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (onUpdateRequest) onUpdateRequest(editingRequest);
                                    setEditingRequest(null);
                                }}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;