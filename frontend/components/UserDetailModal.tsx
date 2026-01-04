import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, Star, GraduationCap, Building2, User as UserIcon, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { User, Tutor } from '../types';

interface UserDetailModalProps {
    user: User | Tutor;
    onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
    // Type Guard to check if user is a Tutor
    const isTutor = (u: User | Tutor): u is Tutor => {
        return (u as Tutor).hourlyRate !== undefined;
    };

    const userIsTutor = isTutor(user);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="absolute -bottom-10 left-8 flex items-end">
                        <div className="relative">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 object-cover bg-white dark:bg-slate-800"
                            />
                            {user.status === 'approved' || user.status === 'active' ? (
                                <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-900 rounded-full p-1">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 fill-white dark:fill-slate-900" />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="pt-12 px-8 pb-8 max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {user.name}
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${user.role === 'tutor' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                    {user.role}
                                </span>
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">ID: {user.id}</p>
                        </div>
                        {userIsTutor && (
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span>{user.rating}</span>
                                    <span className="text-sm text-slate-400 font-normal">({user.reviews} reviews)</span>
                                </div>
                                <div className="text-slate-900 dark:text-white font-bold mt-1">
                                    ₹{user.hourlyRate}/hr
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1: Contact & Status */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                        <Mail className="w-4 h-4 text-indigo-500" />
                                        <span>{user.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                        <Phone className="w-4 h-4 text-indigo-500" />
                                        <span>{user.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                        <MapPin className="w-4 h-4 text-indigo-500" />
                                        <span>{user.address || (userIsTutor ? user.city : 'N/A')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                        <Calendar className="w-4 h-4 text-indigo-500" />
                                        <span>Joined {new Date(user.joinedAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {!userIsTutor && (
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Academic Details</h3>
                                    <div className="space-y-3">
                                        {user.schoolName && (
                                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                                <Building2 className="w-4 h-4 text-indigo-500" />
                                                <span>{user.schoolName}</span>
                                            </div>
                                        )}
                                        {user.grade && (
                                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                                <GraduationCap className="w-4 h-4 text-indigo-500" />
                                                <span>{user.grade}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Column 2: Specifics */}
                        <div className="space-y-6">
                            {userIsTutor && (
                                <>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Expertise</h3>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {user.subjects.map(subject => (
                                                <span key={subject} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {user.levels.map(level => (
                                                <span key={level} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs">
                                                    {level}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">About</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 italic">
                                            "{user.bio}"
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <Clock className="w-4 h-4 text-indigo-500" />
                                            <span>{user.experienceYears} Years Exp.</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <UserIcon className="w-4 h-4 text-indigo-500" />
                                            <span>{user.gender}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
