import React from 'react';
import { StudentRequest } from '../types';
import { MapPin, Monitor, IndianRupee, Clock, Shield, ArrowLeft } from 'lucide-react';

interface StudentRequestsBoardProps {
  requests: StudentRequest[];
  currentUserRole?: string;
  onBack?: () => void;
}

const StudentRequestsBoard: React.FC<StudentRequestsBoardProps> = ({ requests, currentUserRole, onBack }) => {
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
         {requests.length === 0 ? (
           <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No requests found</h3>
              <p className="text-slate-500 dark:text-slate-400">Be the first to see new student requests here.</p>
           </div>
         ) : (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map(req => (
                 <div key={req.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full">
                    <div className="p-6 flex flex-col h-full justify-between">
                       <div>
                          <div className="flex items-start gap-4 mb-4">
                             <img src={req.avatar} alt={req.studentName} className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" />
                             <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{req.subject}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{req.level}</p>
                             </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                req.mode === 'online' 
                                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30' 
                                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100/50 dark:border-emerald-900/30'
                             }`}>
                                {req.mode === 'online' ? <Monitor className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                {req.mode === 'online' ? 'Online' : req.location}
                             </span>
                          </div>

                          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4 italic leading-relaxed">
                            "{req.description}"
                          </p>
                       </div>
                       
                       <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-700">
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                             Requested by <span className="font-semibold text-slate-800 dark:text-slate-200">{req.studentName}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                             <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Posted {new Date(req.postedAt).toLocaleDateString()}
                             </span>
                             <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 dark:bg-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700 rounded-md">
                                <Shield className="w-3 h-3 text-indigo-500" /> Admin Assign
                             </span>
                          </div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
         )}
      </div>
    </div>
  );
};

export default StudentRequestsBoard;