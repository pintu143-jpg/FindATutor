import React, { useState } from 'react';
import { User, ChatSession } from '../types';
import { MessageCircle, User as UserIcon, MapPin, Phone, Mail, LayoutDashboard, HelpCircle, Lock, Sparkles, GraduationCap, Building2, Star, Send, ThumbsUp, Sun, Moon } from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  chatSessions: ChatSession[];
  onUpdateUser: (updatedUser: User) => void;
  onNavigateChat: () => void;
  onContactAdmin: () => void;
  onBecomeTutor: () => void;
  onSubmitFeedback: (rating: number, content: string) => void;
  toggleTheme?: () => void;
  darkMode?: boolean;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  currentUser, 
  chatSessions,
  onUpdateUser,
  onNavigateChat,
  onContactAdmin,
  onBecomeTutor,
  onSubmitFeedback,
  toggleTheme,
  darkMode
}) => {
  const [activeTab, setActiveTab] = useState<'profile'>('profile');
  
  // Feedback State
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Filter chats relevant to this student
  const myChats = chatSessions.filter(s => s.participantIds.includes(currentUser.id));

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    // Call prop function
    onSubmitFeedback(rating, feedbackText);

    // Show visual confirmation
    setFeedbackSubmitted(true);
    // Reset after 3 seconds
    setTimeout(() => {
        setFeedbackSubmitted(false);
        setRating(0);
        setFeedbackText('');
        setHoverRating(0);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                 <div className="relative">
                   <img 
                      src={currentUser.avatar} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full border-4 border-white/20 object-cover" 
                   />
                 </div>
                 
                 <div>
                    <h1 className="text-2xl font-bold">Hello, {currentUser.name}</h1>
                    <p className="text-blue-100 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Student Dashboard
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                  <div className="bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm border border-white/10 text-center">
                      <div className="text-2xl font-bold">{myChats.length}</div>
                      <div className="text-xs text-blue-100 uppercase tracking-wide">Active Chats</div>
                  </div>
                  {toggleTheme && (
                    <button 
                      onClick={toggleTheme}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                      title="Toggle Theme"
                    >
                      {darkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5" />}
                    </button>
                  )}
              </div>
           </div>
           
           {/* Tab Navigation */}
           <div className="flex items-center gap-6 mt-8 border-t border-white/20 pt-4">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'}`}
              >
                <UserIcon className="w-4 h-4" /> My Profile
              </button>
           </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PROFILE TAB */}
        <div className="grid lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2">
          
          {/* Left Column: Quick Actions & Messages */}
          <div className="space-y-6">
             


             {/* Message Center Card */}
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Your Conversations
                </h2>
                
                {myChats.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p>No active conversations yet.</p>
                    <button 
                      onClick={() => window.scrollTo(0, 0)} // Assuming 'Find Tutor' is handled via Nav usually
                      className="mt-2 text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                    >
                      Search for a tutor
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myChats.slice(0, 3).map(chat => (
                      <div key={chat.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer" onClick={onNavigateChat}>
                         <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">Conversation</span>
                            <span className="text-xs text-slate-400">{chat.updatedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                         <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{chat.lastMessagePreview}</p>
                      </div>
                    ))}
                    <button 
                      onClick={onNavigateChat}
                      className="w-full mt-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-center block"
                    >
                      View all messages
                    </button>
                  </div>
                )}
             </div>

             {/* Contact Support */}
             <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 p-6">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Need Help?
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">
                  Contact the administration team if you need assistance finding a tutor or with your account.
                </p>
                <button 
                  onClick={onContactAdmin}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  Contact Admin
                </button>
             </div>
          </div>

          {/* Right Column: Profile Management */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
               <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h2>
                  {/* Edit button removed */}
               </div>

               <div className="p-6">
                    <div className="space-y-6">
                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                             <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Email
                             </div>
                             <div className="text-base font-semibold text-slate-900 dark:text-white">{currentUser.email}</div>
                          </div>
                          {currentUser.phone && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                               <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
                                  <Phone className="w-3 h-3" /> Phone
                               </div>
                               <div className="text-base font-semibold text-slate-900 dark:text-white">{currentUser.phone}</div>
                            </div>
                          )}
                       </div>

                       <div className="grid md:grid-cols-2 gap-6">
                          {currentUser.address && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                               <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
                                  <MapPin className="w-3 h-3" /> Address
                               </div>
                               <div className="text-base font-semibold text-slate-900 dark:text-white">{currentUser.address}</div>
                            </div>
                          )}
                          {currentUser.gender && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                               <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
                                  <UserIcon className="w-3 h-3" /> Gender
                               </div>
                               <div className="text-base font-semibold text-slate-900 dark:text-white capitalize">{currentUser.gender}</div>
                            </div>
                          )}
                       </div>

                       {/* Academic Display */}
                       {(currentUser.schoolName || currentUser.grade) && (
                         <div className="grid md:grid-cols-2 gap-6 pt-2">
                            {currentUser.schoolName && (
                              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                 <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
                                    <Building2 className="w-3 h-3" /> School
                                 </div>
                                 <div className="text-base font-semibold text-slate-900 dark:text-white">{currentUser.schoolName}</div>
                              </div>
                            )}
                            {currentUser.grade && (
                              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                 <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
                                    <GraduationCap className="w-3 h-3" /> Grade/Class
                                 </div>
                                 <div className="text-base font-semibold text-slate-900 dark:text-white">{currentUser.grade}</div>
                              </div>
                            )}
                         </div>
                       )}
                    </div>
               </div>
            </div>

            {/* FEEDBACK SECTION */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ThumbsUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Share Your Experience
                    </h2>
                </div>
                <div className="p-6">
                    {feedbackSubmitted ? (
                        <div className="text-center py-8 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Your feedback has been submitted for admin approval.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                            <div className="flex flex-col items-center justify-center gap-2 mb-4">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate your experience</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star 
                                                className={`w-8 h-8 ${
                                                    (hoverRating || rating) >= star 
                                                        ? 'fill-amber-400 text-amber-400' 
                                                        : 'text-slate-300 dark:text-slate-600'
                                                }`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    How can we improve?
                                </label>
                                <textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Tell us about your experience finding a tutor..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={rating === 0}
                                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                                >
                                    <Send className="w-4 h-4" /> Submit Feedback
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;