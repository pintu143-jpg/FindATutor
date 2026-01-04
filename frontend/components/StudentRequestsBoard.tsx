import React from 'react';
import { StudentRequest, Tutor } from '../types';
import { MapPin, Monitor, IndianRupee, Clock, Shield, ArrowLeft, Star, CheckCircle2 } from 'lucide-react';

interface StudentRequestsBoardProps {
   requests: StudentRequest[];
   featuredTutors?: Tutor[];
   currentUserRole?: string;
   onBack?: () => void;
}

const StudentRequestsBoard: React.FC<StudentRequestsBoardProps> = ({ requests, featuredTutors = [], currentUserRole, onBack }) => {
   const approvedRequests = requests.filter(req => req.isApproved);

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500 pb-20">
         <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-12 relative">
            {onBack && (
               <div className="absolute top-6 left-4 md:left-8 z-10">
                  <button
                     onClick={onBack}
                     className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full transition-all text-slate-700 dark:text-slate-200 font-medium text-sm group"
                  >
                     <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                     <span className="hidden sm:inline">Back</span>
                  </button>
               </div>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
               <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Student Requests</h1>
               <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Browse active learning requests from students. Matching is handled by our administrators to ensure quality connections.
               </p>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               {/* Main Content: Requests */}
               <div className="lg:col-span-3">
                  {approvedRequests.length === 0 ? (
                     <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No requests found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Be the first to see new student requests here.</p>
                     </div>
                  ) : (
                     <div className="grid md:grid-cols-2 gap-6">
                        {approvedRequests.map(req => (
                           <div key={req.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                              <div className="p-6 flex-1">
                                 <div className="flex items-start gap-4 mb-4">
                                    <img src={req.avatar} alt={req.studentName} className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
                                    <div>
                                       <h3 className="font-bold text-slate-900 dark:text-white text-lg">{req.subject}</h3>
                                       <p className="text-sm text-slate-500 dark:text-slate-400">{req.studentName} • {req.level}</p>
                                    </div>
                                 </div>

                                 <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${req.mode === 'online' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                       {req.mode === 'online' ? <Monitor className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                       {req.mode === 'online' ? 'Online' : req.location}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                       <IndianRupee className="w-3 h-3" /> Budget: ₹{req.budget}/hr
                                    </span>
                                 </div>

                                 <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4">
                                    "{req.description}"
                                 </p>

                                 <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock className="w-3 h-3" /> Posted {new Date(req.postedAt).toLocaleDateString()}
                                 </div>
                              </div>

                              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700">
                                 <div className="w-full py-2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                                    <Shield className="w-4 h-4" />
                                    Assignment by Admin Only
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Sidebar: Featured Tutors */}
               <div className="lg:col-span-1 space-y-6">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                     <h3 className="font-bold text-xl mb-2">Featured Tutors</h3>
                     <p className="text-indigo-100 text-sm mb-4">Top-rated educators ready to help you excel.</p>

                     <div className="space-y-4">
                        {featuredTutors.map(tutor => (
                           <div key={tutor.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/20 transition-colors cursor-pointer group">
                              <div className="flex items-center gap-3 mb-2">
                                 <div className="relative">
                                    <img src={tutor.avatar} alt={tutor.name} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                       <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                    </div>
                                 </div>
                                 <div className="min-w-0">
                                    <h4 className="font-bold text-sm truncate">{tutor.name}</h4>
                                    <div className="flex items-center gap-1 text-xs text-indigo-100">
                                       <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                       <span>{tutor.rating}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                 {tutor.subjects.slice(0, 2).map(s => (
                                    <span key={s} className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] truncate max-w-[80px]">
                                       {s}
                                    </span>
                                 ))}
                              </div>
                              <div className="flex items-center justify-between text-xs font-medium">
                                 <span>₹{tutor.hourlyRate}/hr</span>
                                 <span className="text-indigo-200 group-hover:text-white transition-colors">View Profile &rarr;</span>
                              </div>
                           </div>
                        ))}
                        {featuredTutors.length === 0 && (
                           <p className="text-sm opacity-70 italic">No featured tutors yet.</p>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default StudentRequestsBoard;