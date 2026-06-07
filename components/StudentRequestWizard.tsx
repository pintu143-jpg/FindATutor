import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, MapPin, Monitor, User, BookOpen, GraduationCap, Users } from 'lucide-react';

interface WizardData {
  genderPref: string;
  mode: string;
  location: string;
  subject: string;
  level: string;
  type: string;
}

interface StudentRequestWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: WizardData) => void;
}

const StudentRequestWizard: React.FC<StudentRequestWizardProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    type: '',
    genderPref: '',
    mode: '',
    location: '',
    subject: '',
    level: ''
  });

  if (!isOpen) return null;

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSelect = (key: keyof WizardData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
    // Auto advance for simple selections
    if (key !== 'location' && key !== 'subject' && key !== 'level') {
      nextStep();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">What kind of tutor do you need?</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleSelect('type', 'Personal')}
                className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-center group"
              >
                <User className="w-10 h-10 mx-auto mb-3 text-slate-400 group-hover:text-indigo-600" />
                <span className="font-semibold block text-slate-700 dark:text-slate-200">Personal Tutor</span>
                <span className="text-xs text-slate-500">One-on-one attention</span>
              </button>
              <button 
                onClick={() => handleSelect('type', 'Group')}
                className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-center group"
              >
                <Users className="w-10 h-10 mx-auto mb-3 text-slate-400 group-hover:text-indigo-600" />
                <span className="font-semibold block text-slate-700 dark:text-slate-200">Group Class</span>
                <span className="text-xs text-slate-500">Learn with others</span>
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Any gender preference for the tutor?</h3>
            <div className="space-y-3">
              {['Any', 'Male', 'Female'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleSelect('genderPref', opt)}
                  className="w-full p-4 text-left border rounded-xl hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:border-slate-700 dark:text-white transition-all font-medium"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">How do you want to learn?</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleSelect('mode', 'online')}
                className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-center group"
              >
                <Monitor className="w-10 h-10 mx-auto mb-3 text-slate-400 group-hover:text-indigo-600" />
                <span className="font-semibold block text-slate-700 dark:text-slate-200">Online</span>
              </button>
              <button 
                onClick={() => handleSelect('mode', 'offline')}
                className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-center group"
              >
                <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-400 group-hover:text-indigo-600" />
                <span className="font-semibold block text-slate-700 dark:text-slate-200">In-Person</span>
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">
               {data.mode === 'online' ? 'Where are you located? (Timezone/City)' : 'Which area/city for the classes?'}
             </h3>
             <input 
               type="text" 
               className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
               placeholder="e.g. New York, Downtown"
               value={data.location}
               onChange={(e) => setData({...data, location: e.target.value})}
               autoFocus
               onKeyDown={(e) => e.key === 'Enter' && data.location && nextStep()}
             />
             <button 
               onClick={nextStep}
               disabled={!data.location}
               className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
             >
               Next
             </button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">What subject do you need help with?</h3>
             <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 p-4 border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="e.g. Mathematics, Piano, French"
                  value={data.subject}
                  onChange={(e) => setData({...data, subject: e.target.value})}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && data.subject && nextStep()}
                />
             </div>
             <button 
               onClick={nextStep}
               disabled={!data.subject}
               className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
             >
               Next
             </button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">What is the Class/Level?</h3>
             <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 p-4 border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="e.g. Class 10, Beginner, University"
                  value={data.level}
                  onChange={(e) => setData({...data, level: e.target.value})}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && data.level && onComplete(data)}
                />
             </div>
             <button 
               onClick={() => onComplete(data)}
               disabled={!data.level}
               className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
             >
               Find Tutors <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button onClick={prevStep} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Step {step} of 6</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {renderStep()}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800 text-center text-xs text-slate-400">
          FindATeacher AI Assistant
        </div>
      </div>
    </div>
  );
};

export default StudentRequestWizard;