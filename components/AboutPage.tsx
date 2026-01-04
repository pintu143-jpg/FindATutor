import React from 'react';
import { CheckCircle2, Target, Eye, Users, BookOpen, GraduationCap, ShieldCheck, ArrowLeft } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500 pb-20">
      {/* Hero Section */}
      <div className="bg-indigo-900 text-white py-20 relative overflow-hidden">
        
        {/* Back Button */}
        <div className="absolute top-6 left-4 md:left-8 z-30">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all text-white font-medium hover:shadow-lg border border-white/10"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span>Back to Home</span>
          </button>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 pt-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Welcome to FindATeacher, your trusted partner in connecting students with expert educators.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        
        {/* Intro Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-12 border border-slate-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Welcome to FindATeacher</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            FindATeacher is a trusted education marketplace designed to simplify the way students connect with teachers and tutors. Our platform brings learners and educators together, enabling meaningful, effective, and flexible learning experiences—both online and offline.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We are committed to making quality education more accessible while helping educators reach students who genuinely need their expertise.
          </p>
        </div>

        {/* Who We Are */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Who We Are</h2>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              At FindATeacher, we believe that the right teacher can transform a student’s learning journey. Our platform acts as a bridge between motivated students and qualified educators, creating a transparent and efficient environment for learning and teaching.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              We serve students across multiple academic levels and subjects, offering them the freedom to choose tutors based on their preferences—such as subject expertise, location, teaching mode, availability, and budget. At the same time, we empower teachers by providing them with a professional space to showcase their skills and connect with learners directly.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our team consists of education professionals, technology specialists, and dedicated support staff working together to ensure a seamless, reliable, and rewarding experience for all users.
            </p>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-800/50 p-8 rounded-2xl border border-indigo-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Our Vision</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We envision a future where access to quality education is not limited by geography, time, or resources. FindATeacher strives to create an inclusive learning ecosystem where students can easily find the right guidance and educators can grow their teaching careers with confidence.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white dark:from-slate-800 dark:to-slate-800/50 p-8 rounded-2xl border border-purple-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">Our mission is to build a reliable and user-friendly platform that:</p>
            <ul className="space-y-2">
              {[
                "Enables students to find qualified teachers quickly and easily",
                "Helps teachers connect with genuine student requirements",
                "Supports both online and offline learning opportunities",
                "Encourages transparent communication and informed decision-making",
                "Uses technology to improve learning outcomes and teaching reach"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Student–Teacher Matching",
                desc: "We connect students with teachers based on subject, location, mode of learning (online/offline), fees, and experience—ensuring the right fit for both sides.",
                icon: <Users className="w-6 h-6 text-indigo-500" />
              },
              {
                title: "Flexible Learning Options",
                desc: "Students can choose between online classes, offline sessions, or hybrid learning based on their convenience and needs.",
                icon: <BookOpen className="w-6 h-6 text-green-500" />
              },
              {
                title: "Professional Profiles",
                desc: "Educators can create detailed profiles highlighting their qualifications, experience, and teaching style to attract the right students.",
                icon: <GraduationCap className="w-6 h-6 text-blue-500" />
              },
              {
                title: "Direct Communication",
                desc: "Students and teachers can interact directly, discuss requirements, and finalize learning arrangements without unnecessary intermediaries.",
                icon: <Users className="w-6 h-6 text-purple-500" />
              },
              {
                title: "Simple & Accessible",
                desc: "Our platform is easy to use, accessible across devices, and designed to make the entire process smooth and efficient.",
                icon: <CheckCircle2 className="w-6 h-6 text-orange-500" />
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
                <div className="mb-4 bg-slate-50 dark:bg-slate-700 w-12 h-12 flex items-center justify-center rounded-lg">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-indigo-50 dark:bg-slate-800/50 rounded-3xl p-8 md:p-12 border border-indigo-100 dark:border-slate-700 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Why Choose FindATeacher?</h2>
          <div className="grid md:grid-cols-2 gap-y-4 gap-x-8 max-w-3xl mx-auto">
            {[
              { label: "Trusted Education Marketplace", text: "Transparent and reliable connections" },
              { label: "Qualified Educators", text: "Verified teachers across multiple subjects" },
              { label: "Student-Centric Approach", text: "Learning tailored to individual needs" },
              { label: "Teacher Empowerment", text: "Control over fees, schedule, and teaching mode" },
              { label: "Community-Driven Learning", text: "Collaboration between students and educators" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{item.label}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-indigo-600 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join FindATeacher Today</h2>
            <p className="text-indigo-100 text-lg max-w-2xl mx-auto mb-8">
              Whether you are a student looking for the right teacher or an educator seeking motivated learners, FindATeacher is built to support your goals.
            </p>
            <p className="text-indigo-200 font-medium italic">
              Together, we are shaping a smarter, more connected future of learning.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;