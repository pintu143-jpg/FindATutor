import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Loader2, Phone, User as UserIcon, AlertCircle, Check, BookOpen, Presentation, MapPin, Building2, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { ADMIN_ID } from '../constants';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onNavigateHome: () => void;
  existingUsers: User[];
  onRegister: (newUser: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onNavigateHome, existingUsers, onRegister }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [signupRole, setSignupRole] = useState<'student' | 'tutor'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // Mobile starts empty so placeholder shows

  // Extended Fields
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (activeTab === 'signup' && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (activeTab === 'signup' && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Normalize Phone: Add +91 if missing
    // Normalize Phone: Always prepend +91
    const normalizedPhone = `+91 ${phone}`;

    // Check for hidden admin phone
    const isAdmin = normalizedPhone === '+91 9876543210';

    if (activeTab === 'login') {
      // LOGIN LOGIC
      if (isAdmin) {
        if (password !== 'admin0143@find') {
          setIsLoading(false);
          setError("Invalid admin password");
          return;
        }
        const adminUser: User = {
          id: ADMIN_ID,
          name: 'Admin',
          email: 'admin@findateacher.com',
          phone: normalizedPhone,
          avatar: `https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff`,
          role: 'admin',
          isAdmin: true
        };
        setIsLoading(false);
        onLogin(adminUser);
        return;
      }

      // Check against registered users by PHONE
      const foundUser = existingUsers.find(u => u.phone === normalizedPhone);

      if (foundUser) {
        // Simulate password check success
        setIsLoading(false);
        onLogin(foundUser);
      } else {
        setIsLoading(false);
        setError("Account not found. Please register first.");
      }

    } else {
      // SIGNUP LOGIC
      // Check if user already exists
      // Check if user already exists
      const existingUser = existingUsers.find(u => u.phone === normalizedPhone);

      if (existingUser) {
        setIsLoading(false);
        setError("Account with this mobile number already exists. Please log in.");
        return;
      }

      const finalRole = isAdmin ? 'admin' : signupRole;

      // Helper to generate sequential IDs (S-001, T-001)
      const getNextId = (role: 'student' | 'tutor') => {
        const prefix = role === 'student' ? 'S' : 'T';
        // Find IDs that match the prefix format (e.g. S-001)
        const usersOfRole = existingUsers.filter(u => u.role === role);
        const matchingIds = usersOfRole
          .map(u => u.id)
          .filter(id => id.startsWith(`${prefix}-`) && !isNaN(Number(id.split('-')[1])));

        if (matchingIds.length === 0) {
          return `${prefix}-001`;
        }

        const maxId = Math.max(...matchingIds.map(id => parseInt(id.split('-')[1], 10)));
        return `${prefix}-${(maxId + 1).toString().padStart(3, '0')}`;
      };

      // Determine ID based on role
      let newId = `u-${Date.now()}`; // Default fallback
      if (finalRole === 'student') {
        newId = getNextId('student');
      } else if (finalRole === 'tutor') {
        newId = getNextId('tutor');
      }

      const newUser: User = {
        id: newId,
        name: name || 'New User',
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'New User')}&background=${finalRole === 'tutor' ? '6366f1' : '10b981'}&color=fff`,
        role: finalRole,
        isAdmin: isAdmin,
        phone: normalizedPhone,
        address: address,
        gender: gender,
        schoolName: finalRole === 'student' ? schoolName : undefined,
        grade: finalRole === 'student' ? grade : undefined,
        isEmailVerified: false,
        status: finalRole === 'tutor' ? 'pending' : 'active',
        joinedAt: new Date()
      };

      // Register the new user in App state
      onRegister(newUser);

      setIsLoading(false);
      onLogin(newUser);
    }
  };



  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      {/* Mobile Header */}
      <div className="md:hidden p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400" onClick={onNavigateHome}>
          <GraduationCap className="w-6 h-6" />
          <span className="font-bold tracking-tight">FindATeacher</span>
        </div>
      </div>

      {/* Left Side - Visual / Value Prop (Hidden on small mobile) */}
      <div className="hidden md:flex w-1/2 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-800/90"></div>

        <div className="relative z-10 cursor-pointer" onClick={onNavigateHome}>
          <div className="flex items-center gap-2 text-white">
            <GraduationCap className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">FindATeacher</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            {activeTab === 'login' ? 'Welcome back to your learning journey.' : 'Join the largest community of learners and educators.'}
          </h1>
          <ul className="space-y-4 text-lg text-indigo-100">
            <li className="flex items-center gap-3">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4" /></div>
              Connect with 10,000+ expert tutors
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4" /></div>
              AI-powered matching for perfect fit
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4" /></div>
              Secure payments & verified profiles
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-sm text-indigo-200">
          © 2024 FindATeacher Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">

          {/* Back Arrow */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {activeTab === 'login' ? 'Sign in to your account' : 'Create a new account'}
            </h2>
          </div>

          {/* Signup Role Selection */}
          {activeTab === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setSignupRole('student')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all text-center space-y-3 ${signupRole === 'student'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'
                  }`}
              >
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${signupRole === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-bold ${signupRole === 'student' ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>Student</h3>
                  <p className="text-xs text-slate-500">I want to learn</p>
                </div>
              </div>

              <div
                onClick={() => setSignupRole('tutor')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all text-center space-y-3 ${signupRole === 'tutor'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'
                  }`}
              >
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${signupRole === 'tutor' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  <Presentation className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-bold ${signupRole === 'tutor' ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>Tutor</h3>
                  <p className="text-xs text-slate-500">I want to teach</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {activeTab === 'signup' && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><UserIcon className="w-5 h-5" /></div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-white"
                    placeholder="e.g. Alex Johnson"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-5 h-5" />
                  <span className="ml-2 pl-2 border-l border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-medium h-5 flex items-center">
                    +91
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(val);
                  }}
                  className="w-full pl-[5.5rem] pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-white"
                  placeholder="98765 43210"
                />
              </div>
            </div>

            {activeTab === 'signup' && (
              <>
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail className="w-5 h-5" /></div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-white"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><MapPin className="w-4 h-4" /></div>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        placeholder="City"
                      />
                    </div>
                  </div>
                </div>

                {signupRole === 'student' && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">School Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Building2 className="w-4 h-4" /></div>
                        <input
                          type="text"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                          placeholder="School"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Class/Grade</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><GraduationCap className="w-4 h-4" /></div>
                        <input
                          type="text"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                          placeholder="Grade"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-5 h-5" /></div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {activeTab === 'signup' && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-5 h-5" /></div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (activeTab === 'login' ? 'Log In' : 'Create Account')}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setActiveTab(activeTab === 'login' ? 'signup' : 'login'); setError(null); }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                {activeTab === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>

          {/* Demo Credentials Section - REMOVED for security */}


        </div>
      </div>
    </div>
  );
};

export default AuthPage;