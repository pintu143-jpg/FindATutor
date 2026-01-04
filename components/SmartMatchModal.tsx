import React, { useState } from 'react';
import { X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { findSmartMatches } from '../services/geminiService';
import { Tutor } from '../types';

interface SmartMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchesFound: (ids: string[], reasoning: string) => void;
  tutors: Tutor[]; // Added tutors prop to support dynamic data
}

const SmartMatchModal: React.FC<SmartMatchModalProps> = ({ isOpen, onClose, onMatchesFound, tutors }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleMatch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Use the passed tutors prop instead of static mock data
      const result = await findSmartMatches(query, tutors);
      onMatchesFound(result.recommendedTutorIds, result.reasoning);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              AI Smart Match
            </h3>
            <p className="text-indigo-100 text-sm mt-1">
              Describe what you need, and our AI will find the perfect tutors for you.
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            What are you looking for?
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'I need a patient math tutor for my 10-year-old son who struggles with fractions' or 'Looking for an advanced Python mentor for interview prep under ₹500/hr'"
            className="w-full h-32 p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-700 dark:text-white bg-slate-50 dark:bg-slate-900 placeholder-slate-400"
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleMatch}
              disabled={loading || !query.trim()}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all
                ${loading || !query.trim() 
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Find Matches <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartMatchModal;