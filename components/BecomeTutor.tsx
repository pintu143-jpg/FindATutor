import React, { useState, useEffect } from 'react';
import { generateTutorBio } from '../services/geminiService';
import { Sparkles, Wand2, CheckCircle, ArrowLeft, Upload, Phone, FileText, MapPin, Monitor } from 'lucide-react';
import { Tutor, ClassMode, User } from '../types';

interface BecomeTutorProps {
  onBack: () => void;
  onSubmitApplication: (tutorData: any) => void;
  currentUser?: User | null;
}

const BecomeTutor: React.FC<BecomeTutorProps> = ({ onBack, onSubmitApplication, currentUser }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+91 ',
    subjects: '',
    experience: '',
    style: '',
    generatedBio: '',
    hourlyRate: '',
    levels: '',
    resumeName: '',
    classMode: 'online' as ClassMode,
    city: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-fill data if user is logged in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '+91 ',
        city: currentUser.address ? currentUser.address.split(',')[0].trim() : '' // Rough guess for city from address
      }));
    }
  }, [currentUser]);

  const handleGenerateBio = async () => {
    if (!formData.subjects || !formData.experience) return;
    
    setIsGenerating(true);
    const bio = await generateTutorBio(formData.experience, formData.subjects, formData.style || 'Supportive and patient');
    setFormData(prev => ({ ...prev, generatedBio: bio }));
    setIsGenerating(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resumeName: e.target.files![0].name }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct new tutor object
    const newTutor = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subjects: formData.subjects.split(',').map(s => s.trim()),
      levels: formData.levels.split(',').map(s => s.trim()),
      bio: formData.generatedBio,
      experienceYears: parseInt(formData.experience) || 0,
      hourlyRate: parseInt(formData.hourlyRate) || 30,
      avatar: currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
      availability: 'Flexible',
      reviews: 0,
      rating: 0,
      isVerified: false,
      resume: formData.resumeName,
      reviewsList: [],
      classMode: formData.classMode,
      city: formData.city || 'Remote'
    };

    onSubmitApplication(newTutor);
    setStep(2); // Show success state
  };

  if (step === 2) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-green-100 dark:border-green-900 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Application Submitted!</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Thank you, {formData.name}. Your account has been upgraded to a Tutor account. You can now access your dashboard.
        </p>
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-in slide-in-from-right duration-300">
      
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Share Your Knowledge</h2>
        <p className="text-slate-600 dark:text-slate-400">Join our community of expert educators. Fill out the form below to list your profile.</p>
      </div>

      <form onSubmit={handleFormSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Section 1: Basics */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Basic Info</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Jane Doe"
                  disabled={!!currentUser} // Lock name if logged in to maintain consistency
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="e.g. jane@example.com"
                  disabled={!!currentUser} // Lock email if logged in
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input 
                    type="tel" 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="98765 43210"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">For admin verification. Not shown publicly.</p>
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Resume / CV (PDF)</label>
                <div className="relative border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                   <input 
                     type="file" 
                     accept=".pdf"
                     required
                     onChange={handleFileChange}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   />
                   <div className="flex items-center justify-center gap-2 py-2 px-4 text-sm text-slate-600 dark:text-slate-300">
                     <Upload className="w-4 h-4" />
                     <span className="truncate max-w-[150px]">
                       {formData.resumeName || "Upload PDF Resume"}
                     </span>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subjects (comma separated)</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.subjects}
                  onChange={e => setFormData({...formData, subjects: e.target.value})}
                  placeholder="e.g. Math, Physics"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Levels Taught (comma separated)</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.levels}
                  onChange={e => setFormData({...formData, levels: e.target.value})}
                  placeholder="e.g. Class X, Class XII"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Teaching Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Teaching Preferences</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['online', 'offline', 'both'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setFormData({...formData, classMode: mode as ClassMode})}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border capitalize transition-colors ${
                          formData.classMode === mode 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City (Required for Offline/Both)</label>
                   <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        required={formData.classMode !== 'online'}
                        disabled={formData.classMode === 'online'}
                        className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                          formData.classMode === 'online' 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
                        }`}
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        placeholder={formData.classMode === 'online' ? "Online Only" : "e.g. New York"}
                      />
                   </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Details</h3>
              <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
                <Sparkles className="w-3 h-3" /> AI Powered
              </span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Years of Experience</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.experience}
                  onChange={e => setFormData({...formData, experience: e.target.value})}
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hourly Rate (₹)</label>
                 <input 
                   type="number" 
                   required
                   className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                   value={formData.hourlyRate}
                   onChange={e => setFormData({...formData, hourlyRate: e.target.value})}
                   placeholder="e.g. 45"
                 />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teaching Style</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.style}
                  onChange={e => setFormData({...formData, style: e.target.value})}
                  placeholder="e.g. Visual, Hands-on"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Bio</label>
              <textarea 
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[120px]"
                value={formData.generatedBio}
                onChange={e => setFormData({...formData, generatedBio: e.target.value})}
                placeholder="Tell students about yourself..."
              />
              <button
                type="button"
                onClick={handleGenerateBio}
                disabled={isGenerating || !formData.subjects}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Wand2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Writing...' : 'Auto-Generate Bio'}
              </button>
            </div>
          </div>

        </div>
        
        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            type="submit"
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default BecomeTutor;