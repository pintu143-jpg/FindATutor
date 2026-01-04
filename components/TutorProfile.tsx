import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, CheckCircle2, Shield, Calendar, MapPin, MessageCircle, GraduationCap, Monitor, Building2, MessageSquarePlus, Send, X } from 'lucide-react';
import { Tutor, User, Review } from '../types';
import BookingModal from './BookingModal';

interface TutorProfileProps {
  tutor: Tutor;
  onBack: () => void;
  onStartChat?: (tutorId: string) => void;
  onBookLesson?: (tutorId: string) => void;
  onAddReview?: (review: Review) => void;
  currentUser?: User | null;
}

const TutorProfile: React.FC<TutorProfileProps> = ({ tutor, onBack, onStartChat, onBookLesson, onAddReview, currentUser }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Review State
  const [localReviews, setLocalReviews] = useState<Review[]>(tutor.reviewsList || []);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setLocalReviews(tutor.reviewsList || []);
  }, [tutor]);

  const handleBookClick = () => {
    if (!currentUser) {
        alert("Please log in to book a lesson.");
        return;
    }
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (tutorId: string) => {
    if (onBookLesson) {
      onBookLesson(tutorId);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0 || !newComment.trim()) return;

    const newReview: Review = {
      id: `new-${Date.now()}`,
      studentName: currentUser?.name || 'Anonymous Student',
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split('T')[0]
    };

    // Optimistic update
    setLocalReviews([newReview, ...localReviews]);
    
    // Propagate to parent
    if (onAddReview) {
      onAddReview(newReview);
    }

    setIsReviewModalOpen(false);
    setNewRating(0);
    setNewComment('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 animate-in slide-in-from-right duration-300">
      
      {currentUser && (
        <BookingModal 
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            tutor={tutor}
            currentUser={currentUser}
            onConfirmBooking={handleConfirmBooking}
        />
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Write a Review</h3>
                <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                   <X className="w-5 h-5" />
                </button>
             </div>
             <div className="p-6">
                <form onSubmit={handleSubmitReview}>
                   <div className="flex flex-col items-center justify-center gap-2 mb-6">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate your experience</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star 
                              className={`w-8 h-8 ${
                                (hoverRating || newRating) >= star 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'text-slate-300 dark:text-slate-600'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                   </div>
                   
                   <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Feedback</label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your experience with this tutor..."
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                        required
                      />
                   </div>

                   <button 
                     type="submit"
                     disabled={newRating === 0 || !newComment.trim()}
                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Send className="w-4 h-4" /> Submit Review
                   </button>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* Header / Nav - Adjusted sticky position to accommodate main navbar */}
      <div className="bg-white dark:bg-slate-800 sticky top-16 z-30 border-b border-slate-200 dark:border-slate-700 px-4 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Tutor Profile</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <img 
                  src={tutor.avatar} 
                  alt={tutor.name} 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-50 dark:border-slate-700 shadow-inner"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{tutor.name}</h2>
                    {tutor.isVerified && (
                      <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold border border-blue-100 dark:border-blue-800">
                        <CheckCircle2 className="w-3 h-3" /> Verified Tutor
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                       <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                       <span className="font-semibold text-slate-900 dark:text-white">{tutor.rating}</span>
                       <span className="text-slate-400">({localReviews.length} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <Shield className="w-4 h-4 text-slate-400" />
                       <span>{tutor.experienceYears} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <MapPin className="w-4 h-4 text-slate-400" />
                       <span>{tutor.city}</span>
                    </div>
                  </div>

                  {/* Class Mode Display */}
                  <div className="flex flex-wrap gap-3 mb-4">
                     {tutor.classMode === 'online' || tutor.classMode === 'both' ? (
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-800">
                          <Monitor className="w-4 h-4" />
                          <span className="text-sm font-medium">Online Classes</span>
                       </div>
                     ) : null}
                     
                     {tutor.classMode === 'offline' || tutor.classMode === 'both' ? (
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-100 dark:border-amber-800">
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm font-medium">In-Person ({tutor.city})</span>
                       </div>
                     ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map(sub => (
                      <span key={sub} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About Me</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                {tutor.bio}
              </p>
              
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Levels Taught
                </h4>
                <div className="flex flex-wrap gap-2">
                   {tutor.levels && tutor.levels.length > 0 ? (
                      tutor.levels.map(level => (
                        <span key={level} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full border border-indigo-100 dark:border-indigo-800">
                          {level}
                        </span>
                      ))
                   ) : (
                      <span className="text-slate-500 italic text-sm">Not specified</span>
                   )}
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Weekly Schedule
               </h3>
               <p className="text-slate-600 dark:text-slate-300">{tutor.availability}</p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                 <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Student Reviews</h3>
                    <span className="text-slate-500 text-sm bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{localReviews.length}</span>
                 </div>
                 
                 {/* Feedback Button - Visible to everyone except the tutor themselves */}
                 {currentUser && currentUser.id !== tutor.id && (
                   <button 
                     onClick={() => setIsReviewModalOpen(true)}
                     className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
                   >
                     <MessageSquarePlus className="w-4 h-4" /> Write a Review
                   </button>
                 )}
              </div>
              
              <div className="space-y-6">
                {localReviews.length > 0 ? (
                  localReviews.map(review => (
                    <div key={review.id} className="border-b border-slate-100 dark:border-slate-700 pb-6 last:border-0 last:pb-0 animate-in fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                             {review.studentName.charAt(0)}
                           </div>
                           <span className="font-semibold text-slate-900 dark:text-white">{review.studentName}</span>
                        </div>
                        <span className="text-sm text-slate-400">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                           <Star 
                             key={i} 
                             className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-600'}`} 
                           />
                        ))}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm italic">"{review.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No reviews yet. Be the first to review!
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar (Right Column) - Booking */}
          <div className="lg:col-span-1">
             <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 sticky top-32 transition-all">
                <div className="flex justify-between items-end mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                   <div>
                     <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Hourly Rate</p>
                     <div className="flex items-center gap-1">
                       <span className="text-3xl font-bold text-slate-900 dark:text-white">₹{tutor.hourlyRate}</span>
                       <span className="text-slate-500 dark:text-slate-400 text-sm mb-1">/hr</span>
                     </div>
                   </div>
                   <div className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded text-xs font-semibold">
                      <Clock className="w-3 h-3" /> Available
                   </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Availability</p>
                       <p className="text-sm font-medium text-slate-900 dark:text-white">{tutor.availability}</p>
                    </div>
                  </div>
                  
                  {/* Location Info */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Location</p>
                       <p className="text-sm font-medium text-slate-900 dark:text-white">
                         {tutor.classMode === 'online' ? 'Remote Only' : `${tutor.city} ${tutor.classMode === 'both' ? '(+ Online)' : ''}`}
                       </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                     <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                     <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Satisfaction Guarantee</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Free 1st Lesson Trial</p>
                     </div>
                  </div>
                </div>

                <button 
                  onClick={handleBookClick}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all transform active:scale-95"
                >
                  Request Lesson
                </button>
                
                <p className="text-xs text-center text-slate-400 mt-4">
                  Request a lesson to be matched by our admin team.
                </p>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TutorProfile;