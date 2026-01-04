import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Tutor, User } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: Tutor;
  currentUser: User;
  onConfirmBooking: (tutorId: string) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, tutor, currentUser, onConfirmBooking }) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleBook = () => {
    setStep(2); // Show processing/success
    
    // Simulate API
    setTimeout(() => {
        onConfirmBooking(tutor.id);
        setStep(3);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Request a Lesson</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6">
            {step === 1 && (
                <>
                    <div className="flex items-start gap-4 mb-6">
                        <img src={tutor.avatar} alt={tutor.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-600" />
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">{tutor.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{tutor.subjects[0]} • {tutor.experienceYears} Years Exp.</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                            <span className="font-semibold text-slate-900 dark:text-white">1 Hour</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2"><Calendar className="w-4 h-4" /> Rate</span>
                            <span className="font-semibold text-slate-900 dark:text-white">₹{tutor.hourlyRate.toFixed(2)} / hr</span>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                       By confirming, you will send a booking request to {tutor.name}. 
                       Payment will be handled off-platform or as per the tutor's instructions.
                    </p>

                    <button 
                        onClick={handleBook}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        Send Booking Request <ArrowRight className="w-4 h-4" />
                    </button>
                </>
            )}

            {step === 2 && (
                 <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Sending Request...</h4>
                 </div>
            )}

            {step === 3 && (
                 <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">Request Sent!</h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-xs">
                      {tutor.name} has been notified of your interest. Check your messages for their response.
                    </p>
                    <button 
                      onClick={onClose}
                      className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                      Close
                    </button>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;