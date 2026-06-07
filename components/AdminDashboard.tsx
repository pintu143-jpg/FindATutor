import React, { useState } from 'react';
import { CheckCircle2, XCircle, Shield, Search, Check, Mail, Edit, X, Save, Phone, FileText, Users, TrendingUp, BarChart3, AlertCircle, IndianRupee, Activity, Clock, BookOpen, MapPin, Monitor, Send, GraduationCap, List, Link as LinkIcon, UserPlus, UserMinus, ThumbsUp, Star, Quote, Building2, Briefcase, Trash2, Sun, Moon } from 'lucide-react';
import { Tutor, StudentRequest, User, PlatformReview } from '../types';

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
  toggleTheme?: () => void;
  darkMode?: boolean;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
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
  toggleTheme,
  darkMode,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'tutors' | 'students' | 'feedback'>('tutors');
  const [studentView, setStudentView] = useState<'all' | 'active' | 'requests'>('all');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<'all' | 'Student' | 'Tutor'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tutor Tab Assignment State
  const [assigningTutorId, setAssigningTutorId] = useState<string | null>(null);
  const [studentIdToAssign, setStudentIdToAssign] = useState('');

  // Edit Modal State
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

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

  // Filter requests to only show Pending ones for the "Requests" view
  const pendingRequestsList = studentRequests.filter(req => req.status === 'pending');

  // Tutor Stats
  const pendingTutorCount = tutors.filter(t => t.status === 'pending').length;
  const activeTutorCount = tutors.filter(t => t.status === 'approved').length;
  
  // Student Stats
  const totalStudentCount = students.length;
  const activeStudentCount = students.filter(s => s.status === 'active' || !s.status).length;
  const pendingStudentCount = students.filter(s => s.status === 'pending').length; 
  const suspendedStudentCount = students.filter(s => s.status === 'suspended').length;

  const pendingRequestsCount = pendingRequestsList.length;
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

      const searchValue = studentIdToAssign.trim().toLowerCase();

      // 1. Search for student by exact name or ID
      let matchedStudent = students.find(s => 
        s.id.toLowerCase() === searchValue || 
        s.name.toLowerCase() === searchValue
      );

      // 2. Fallback: Search for student by partial name/ID
      if (!matchedStudent) {
          matchedStudent = students.find(s => 
            s.name.toLowerCase().includes(searchValue) ||
            s.id.toLowerCase().includes(searchValue)
          );
      }

      if (matchedStudent) {
          // Find if there is an active or pending request for this student
          const targetRequest = studentRequests.find(r => 
            r.studentId === matchedStudent!.id && 
            (r.status === 'pending' || r.status === 'matched')
          );

          if (targetRequest) {
              onMatchStudent(targetRequest.id, tutorId);
          } else {
              // Direct assignment (no request exists)
              onMatchStudent(`direct-assign:${matchedStudent!.id}`, tutorId);
          }
          setAssigningTutorId(null);
          setStudentIdToAssign('');
      } else {
          if (showToast) {
              showToast('Assignment Error', `No student found with ID or Name matching: "${studentIdToAssign}"`, 'error');
          } else {
              alert(`No student found with ID or Name matching: "${studentIdToAssign}"`);
          }
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

           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
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
                               <tr key={tutor.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
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
                                        </div>
                                     </div>
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
                                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                        tutor.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
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
                                              <button onClick={() => onApprove(tutor.id)} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors" title="Approve">
                                                 <Check className="w-4 h-4" />
                                              </button>
                                              <button onClick={() => onReject(tutor.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Reject">
                                                 <X className="w-4 h-4" />
                                              </button>
                                           </>
                                        )}
                                        <button 
                                          onClick={() => setEditingTutor(tutor)}
                                          className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                                          title="Edit"
                                        >
                                           <Edit className="w-4 h-4" />
                                        </button>
                                        {onMatchStudent && (
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setAssigningTutorId(assigningTutorId === tutor.id ? null : tutor.id)}
                                                    className={`p-1.5 rounded transition-colors ${assigningTutorId === tutor.id ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
                                                    title="Assign to Student"
                                                >
                                                    <LinkIcon className="w-4 h-4" />
                                                </button>
                                                
                                                {/* Quick Assign Popover */}
                                                {assigningTutorId === tutor.id && (
                                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 animate-in zoom-in-95 duration-100">
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">Assign {tutor.name} to:</p>
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="text" 
                                                                placeholder="Student ID or Name"
                                                                className="flex-1 px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-900 dark:text-white"
                                                                value={studentIdToAssign}
                                                                onChange={(e) => setStudentIdToAssign(e.target.value)}
                                                            />
                                                            <button 
                                                                onClick={() => handleTutorAssignStudent(tutor.id)}
                                                                disabled={!studentIdToAssign}
                                                                className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-700 disabled:opacity-50"
                                                            >
                                                                Link
                                                            </button>
                                                        </div>
                                                        {(() => {
                                                            const searchValue = studentIdToAssign.trim().toLowerCase();
                                                            const suggestions = searchValue
                                                                ? students.filter(s => 
                                                                    s.name.toLowerCase().includes(searchValue) || 
                                                                    s.id.toLowerCase().includes(searchValue)
                                                                  ).slice(0, 5)
                                                                : [];
                                                            return suggestions.length > 0 ? (
                                                                <div className="mt-2 max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                                                                    {suggestions.map(student => (
                                                                        <button
                                                                            key={student.id}
                                                                            type="button"
                                                                            onClick={() => setStudentIdToAssign(student.name)}
                                                                            className="w-full text-left px-2 py-1.5 text-xs hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors"
                                                                        >
                                                                            <span className="font-medium truncate">{student.name}</span>
                                                                            <span className="text-[10px] text-slate-400 font-mono ml-2">{student.id}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            ) : null;
                                                        })()}
                                                        <p className="text-[10px] text-slate-400 mt-2">
                                                            Enter name or ID to match. Will link request or assign directly.
                                                        </p>
                                                    </div>
                                                )}
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
                        <button
                            onClick={() => setStudentView('requests')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 sm:flex-none ${studentView === 'requests' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Lesson Requests
                        </button>
                    </div>
                    <div className="relative w-full sm:w-64">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                       <input 
                         type="text" 
                         placeholder="Search..." 
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
                                    <th className="p-4 font-semibold">{studentView === 'requests' ? 'Requested Tutor' : 'Contact'}</th>
                                    <th className="p-4 font-semibold">{studentView === 'requests' ? 'Subject & Level' : 'Status'}</th>
                                    <th className="p-4 font-semibold">{studentView === 'requests' ? 'Details' : 'Actions'}</th>
                                    {studentView === 'requests' && <th className="p-4 font-semibold">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {studentView === 'requests' ? (
                                    (() => {
                                        const pendingTutorRequests = studentRequests.filter(req => {
                                            if (req.status !== 'pending' || !req.assignedTutorId) return false;
                                            const tutor = tutors.find(t => t.id === req.assignedTutorId);
                                            return (tutor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                   req.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                   req.description.toLowerCase().includes(searchTerm.toLowerCase());
                                        });
                                        
                                        return pendingTutorRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                                    No pending tutor-specific lesson requests found.
                                                </td>
                                            </tr>
                                        ) : (
                                            pendingTutorRequests.map(req => {
                                                const tutor = tutors.find(t => t.id === req.assignedTutorId);
                                                return (
                                                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <img src={req.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{req.studentName}</p>
                                                                    <p className="text-[10px] text-slate-400 font-mono">ID: {req.studentId}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            {tutor ? (
                                                                <div className="flex items-center gap-2">
                                                                    <img src={tutor.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{tutor.name}</p>
                                                                        <p className="text-[10px] text-slate-400 font-mono">ID: {tutor.id}</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-500 text-sm">Unknown Tutor</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-sm">
                                                            <div className="text-slate-900 dark:text-white">
                                                                <p className="font-semibold">{req.subject}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{req.level}</p>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-xs text-slate-600 dark:text-slate-300 italic max-w-xs truncate" title={req.description}>
                                                            "{req.description}"
                                                        </td>
                                                        <td className="p-4">
                                                            {onMatchStudent && (
                                                                <button 
                                                                    onClick={() => {
                                                                        onMatchStudent(req.id, req.assignedTutorId);
                                                                        if (showToast) {
                                                                            showToast('Request Approved', 'Linked student and tutor successfully.', 'success');
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" /> Approve & Link
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        );
                                    })()
                                ) : (
                                    filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                                No students found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map(student => (
                                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
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
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                                        student.status === 'suspended' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}>
                                                        {student.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
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
                                        ))
                                    )
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
                                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                                                review.status === 'approved' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'
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
                      onChange={e => setEditingTutor({...editingTutor, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subjects (comma separated)</label>
                    <input 
                      type="text" 
                      value={editingTutor.subjects.join(', ')}
                      onChange={e => setEditingTutor({...editingTutor, subjects: e.target.value.split(',').map(s=>s.trim())})}
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
                      onChange={e => setEditingStudent({...editingStudent, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={editingStudent.email}
                      onChange={e => setEditingStudent({...editingStudent, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={editingStudent.phone || ''}
                      onChange={e => setEditingStudent({...editingStudent, phone: e.target.value})}
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

    </div>
  );
};

export default AdminDashboard;