import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { User, Tutor, ChatSession, ClassMode } from '../types';
import { MessageCircle, IndianRupee, LayoutDashboard, HelpCircle, MapPin, AlertTriangle, User as UserIcon, Briefcase, Mail, Phone, GraduationCap, Clock, BookOpen, Monitor, Award, AlertOctagon, ArrowRight, Edit, Save, X, ThumbsUp, Star, Send, Sun, Moon, Upload, ZoomIn, Check } from 'lucide-react';

interface TutorDashboardProps {
  currentUser: User;
  tutorProfile: Tutor;
  chatSessions: ChatSession[];
  students: User[];
  onUpdateProfile: (updatedTutor: Tutor) => void;
  onNavigateChat: () => void;
  onContactAdmin: () => void;
  onSubmitFeedback: (rating: number, content: string) => void;
  toggleTheme?: () => void;
  darkMode?: boolean;
}

const TutorDashboard: React.FC<TutorDashboardProps> = ({
  currentUser,
  tutorProfile,
  chatSessions,
  students,
  onUpdateProfile,
  onNavigateChat,
  onContactAdmin,
  onSubmitFeedback,
  toggleTheme,
  darkMode
}) => {
  const [showJobWarning, setShowJobWarning] = useState(false);
  const [isEditingJobProfile, setIsEditingJobProfile] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCroppedImage = async () => {
    if (tempImageSrc && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(tempImageSrc, croppedAreaPixels);
        onUpdateProfile({ ...tutorProfile, avatar: croppedImage });
        setTempImageSrc(null); // Return to default view
        setShowImageModal(false); // Close modal
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setTempImageSrc(null); // Reset temp image
  };

  // Feedback State
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // State for editing form
  const [editFormData, setEditFormData] = useState({
    hourlyRate: 0,
    experienceYears: 0,
    subjects: '',
    levels: '',
    bio: '',
    availability: '',
    city: '',
    classMode: 'online' as ClassMode,
    qualifications: ''
  });

  // Check if Job Profile is complete
  const isJobProfileComplete = (profile: Tutor) => {
    return (
      profile.hourlyRate > 0 &&
      profile.experienceYears > 0 &&
      profile.subjects.length > 0 &&
      profile.bio.length > 10 &&
      profile.availability.length > 0
    );
  };

  // Check for profile completion on mount
  useEffect(() => {
    if (!isJobProfileComplete(tutorProfile)) {
      setShowJobWarning(true);
    }
  }, []);

  // Filter chats relevant to this tutor
  const myChats = chatSessions.filter(s => s.participantIds.includes(tutorProfile.id));

  const handleEditClick = () => {
    setEditFormData({
      hourlyRate: tutorProfile.hourlyRate,
      experienceYears: tutorProfile.experienceYears,
      subjects: tutorProfile.subjects.join(', '),
      levels: tutorProfile.levels.join(', '),
      bio: tutorProfile.bio,
      availability: tutorProfile.availability,
      city: tutorProfile.city,
      classMode: tutorProfile.classMode,
      qualifications: tutorProfile.qualifications || ''
    });
    setIsEditingJobProfile(true);
  };

  const handleSaveJobProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTutor = {
      ...tutorProfile,
      hourlyRate: Number(editFormData.hourlyRate),
      experienceYears: Number(editFormData.experienceYears),
      subjects: editFormData.subjects.split(',').map(s => s.trim()).filter(s => s),
      levels: editFormData.levels.split(',').map(s => s.trim()).filter(s => s),
      bio: editFormData.bio,
      availability: editFormData.availability,
      city: editFormData.city,
      classMode: editFormData.classMode,
      qualifications: editFormData.qualifications
    };
    onUpdateProfile(updatedTutor);
    setIsEditingJobProfile(false);
  };

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500 relative">

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={(e) => {
          if (e.target === e.currentTarget && !tempImageSrc) handleCloseModal();
        }}>
          <div className={`relative w-full ${tempImageSrc ? 'max-w-2xl h-[600px]' : 'max-w-lg'} animate-in zoom-in duration-200 bg-white dark:bg-slate-800 rounded-lg overflow-hidden flex flex-col`}>
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center z-10 bg-white dark:bg-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {tempImageSrc ? 'Crop & Adjust' : 'Profile Photo'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                <span className="sr-only">Close</span>
                <X className="w-6 h-6" />
              </button>
            </div>

            {tempImageSrc ? (
              <div className="flex-1 relative bg-black">
                <div className="absolute inset-0 top-0 bottom-16">
                  <Cropper
                    image={tempImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    showGrid={true}
                  />
                </div>
                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <ZoomIn className="w-4 h-4 text-slate-500" />
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                    />
                  </div>
                  <button
                    onClick={() => setTempImageSrc(null)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCroppedImage}
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center gap-6">
                <img src={tutorProfile.avatar} alt="Full Profile" className="w-64 h-64 rounded-full shadow-xl border-4 border-slate-100 dark:border-slate-700 object-cover" />

                <div className="flex gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    <Upload className="w-4 h-4" /> Change Photo
                  </button>
                </div>
                <p className="text-sm text-slate-500 text-center max-w-xs">
                  Upload a new photo to personalize your profile. JPG, PNG less than 5MB recommended.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Job Profile Modal */}
      {isEditingJobProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Job Profile</h3>
              <button onClick={() => setIsEditingJobProfile(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="edit-job-profile-form" onSubmit={handleSaveJobProfile} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      value={editFormData.hourlyRate}
                      onChange={e => setEditFormData({ ...editFormData, hourlyRate: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={editFormData.experienceYears}
                      onChange={e => setEditFormData({ ...editFormData, experienceYears: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class Mode</label>
                    <select
                      value={editFormData.classMode}
                      onChange={e => setEditFormData({ ...editFormData, classMode: e.target.value as ClassMode })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none capitalize"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City / Location</label>
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={e => setEditFormData({ ...editFormData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subjects (comma separated)</label>
                  <input
                    type="text"
                    value={editFormData.subjects}
                    onChange={e => setEditFormData({ ...editFormData, subjects: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Levels Taught (comma separated)</label>
                  <input
                    type="text"
                    value={editFormData.levels}
                    onChange={e => setEditFormData({ ...editFormData, levels: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={editFormData.qualifications}
                    onChange={e => setEditFormData({ ...editFormData, qualifications: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. PhD in Physics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Availability</label>
                  <input
                    type="text"
                    value={editFormData.availability}
                    onChange={e => setEditFormData({ ...editFormData, availability: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Weekdays 4PM-8PM"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio / Profile Description</label>
                  <textarea
                    value={editFormData.bio}
                    onChange={e => setEditFormData({ ...editFormData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                    required
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={() => setIsEditingJobProfile(false)}
                className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-job-profile-form"
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Profile Warning Modal */}
      {showJobWarning && !isEditingJobProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" id="job-warning-modal">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-red-100 dark:border-red-900">
            <div className="bg-red-50 dark:bg-red-900/30 p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Incomplete Job Profile</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                You must complete your Job Profile details (Hourly Rate, Subjects, Experience, Bio) to be visible to students.
              </p>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <button
                onClick={() => { setShowJobWarning(false); handleEditClick(); }}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                Update Profile Now <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowJobWarning(false)}
                className="w-full py-3 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={tutorProfile.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-indigo-200/30 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowImageModal(true)}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold">Welcome back, {tutorProfile.name}</h1>
                <p className="text-indigo-200 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Instructor Dashboard
                </p>
                {tutorProfile.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded text-xs mt-2 border border-yellow-500/30">
                    <AlertTriangle className="w-3 h-3" /> Profile Pending Approval
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex gap-4">
                <div className="bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm border border-white/10 text-center">
                  <div className="text-2xl font-bold">{tutorProfile.rating}</div>
                  <div className="text-xs text-indigo-200 uppercase tracking-wide">Rating</div>
                </div>
                <div className="bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm border border-white/10 text-center">
                  <div className="text-2xl font-bold">{tutorProfile.reviews}</div>
                  <div className="text-xs text-indigo-200 uppercase tracking-wide">Reviews</div>
                </div>
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
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ... rest of the file ... */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column: Quick Actions & Messages */}
          <div className="space-y-6">
            {/* Message Center Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Recent Inquiries
              </h2>

              {myChats.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p>No active conversations yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myChats.slice(0, 3).map(chat => {
                    const studentId = chat.participantIds.find(id => id !== tutorProfile.id);
                    const student = students.find(s => s.id === studentId);
                    return (
                      <div key={chat.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer" onClick={onNavigateChat}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white text-sm">
                            {student ? `${student.name} (ID: ${student.id})` : 'Student Inquiry'}
                          </span>
                          <span className="text-xs text-slate-400">{chat.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{chat.lastMessagePreview}</p>
                      </div>
                    );
                  })}
                  <button
                    onClick={onNavigateChat}
                    className="w-full mt-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-center block"
                  >
                    View all messages
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Your Reach</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 text-sm">Profile Views</span>
                  <span className="font-semibold text-slate-900 dark:text-white">124</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-600 dark:text-slate-400 text-sm">Response Rate</span>
                  <span className="font-semibold text-slate-900 dark:text-white">95%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 p-6">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Need Help?
              </h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">
                Contact the administration team for any issues with your account or students.
              </p>
              <button
                onClick={onContactAdmin}
                className="w-full py-2 bg-indigo-600 dark:bg-indigo-600 text-white rounded-lg font-medium text-sm transition-colors hover:bg-indigo-700 dark:hover:bg-indigo-500"
              >
                Contact Admin
              </button>
            </div>
          </div>

          {/* Right Column: Profile Management */}
          <div className="lg:col-span-2 space-y-8">
            {/* ... SECTION 1, 2, 3 ... unchanged */}
            {/* SECTION 1: PERSONAL DETAILS */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Personal Details
                </h2>
                {/* Personal details are usually locked or edited separately */}
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><UserIcon className="w-3 h-3" /> Full Name</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{tutorProfile.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{tutorProfile.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{tutorProfile.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><UserIcon className="w-3 h-3" /> Gender</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{tutorProfile.gender || 'Not specified'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{tutorProfile.address || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: JOB PROFILE */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Job Profile
                </h2>
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1"><Clock className="w-3 h-3" /> Availability</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{tutorProfile.availability || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location / City</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{tutorProfile.city}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Monitor className="w-3 h-3" /> Class Mode</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{tutorProfile.classMode}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Hourly Rate</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">₹{tutorProfile.hourlyRate}/hr</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Award className="w-3 h-3" /> Experience</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{tutorProfile.experienceYears} Years</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Higher Qualification</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{tutorProfile.qualifications || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Teaching Subjects</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tutorProfile.subjects.length > 0 ? (
                        tutorProfile.subjects.map(sub => (
                          <span key={sub} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                            {sub}
                          </span>
                        ))
                      ) : <span className="text-sm text-slate-400 italic">None specified</span>}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Teaching Classes/Levels</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tutorProfile.levels && tutorProfile.levels.length > 0 ? (
                        tutorProfile.levels.map(level => (
                          <span key={level} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-600">
                            {level}
                          </span>
                        ))
                      ) : <span className="text-sm text-slate-400 italic">None specified</span>}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Tutor Quotation / Bio</div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 italic">
                      {tutorProfile.bio ? `"${tutorProfile.bio}"` : <span className="text-slate-400 not-italic">No bio provided.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: PLATFORM FEEDBACK */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Share Your Platform Experience
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
                      Your feedback helps us improve the platform for all tutors.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center gap-2 mb-4">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate the platform</label>
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
                              className={`w-8 h-8 ${(hoverRating || rating) >= star
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
                        Your Feedback or Suggestions
                      </label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="How can we make teaching easier for you?"
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

export default TutorDashboard;