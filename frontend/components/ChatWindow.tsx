import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, MoreVertical, MessageCircle, ArrowLeft, Users, Shield } from 'lucide-react';
import { User, ChatSession, Tutor } from '../types';
import { ADMIN_ID } from '../constants';

interface ChatWindowProps {
  currentUser: User;
  activeSessionId: string | null;
  sessions: ChatSession[];
  tutors: Tutor[]; // To resolve names/avatars if the participant is a tutor
  students: User[]; // To resolve names/avatars if the participant is a student
  onSelectSession: (sessionId: string) => void;
  onSendMessage: (sessionId: string, text: string) => void;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  currentUser, 
  activeSessionId, 
  sessions, 
  tutors,
  students,
  onSelectSession, 
  onSendMessage,
  onBack
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Helper to get the "other" participant's name/avatar, or both if monitoring
  const getParticipantInfo = (session: ChatSession) => {
    const isMeInChat = session.participantIds.includes(currentUser.id);

    // 1. Admin Monitoring View (Admin is NOT a participant)
    if (currentUser.isAdmin && !isMeInChat) {
        // Find the tutor
        const tutorId = session.participantIds.find(id => tutors.some(t => t.id === id));
        const tutor = tutors.find(t => t.id === tutorId);
        
        // Find the student
        const studentId = session.participantIds.find(id => id !== tutorId && id !== ADMIN_ID);
        const student = students.find(s => s.id === studentId);

        const tutorName = tutor?.name || `Tutor ${tutorId || '?'}`;
        const studentName = student?.name || `Student ${studentId || '?'}`;

        return {
            name: `${tutorName} ↔ ${studentName}`,
            avatar: null, // We'll handle null avatar in UI by showing a group icon
            role: 'Monitoring',
            isMonitoring: true,
            subtext: `T: ${tutorId} | S: ${studentId}`
        };
    }

    // 2. Direct Chat (Admin chatting with someone, or User chatting with someone)
    const otherId = session.participantIds.find(id => id !== currentUser.id);

    // If I am chatting with Admin
    if (otherId === ADMIN_ID) {
        return { name: 'Support Team', avatar: 'https://ui-avatars.com/api/?name=Admin+Support&background=0f172a&color=fff', role: 'Admin', subtext: 'System Admin' };
    }

    // If I am chatting with Tutor (or I am Admin chatting with Tutor)
    const tutor = tutors.find(t => t.id === otherId);
    if (tutor) {
      // If I am a student, I want to see the Tutor's ID clearly
      const subtext = currentUser.role === 'student' ? `Tutor ID: ${tutor.id}` : undefined;
      return { name: tutor.name, avatar: tutor.avatar, role: 'Tutor', subtext };
    }

    // If I am chatting with Student (or I am Admin chatting with Student)
    const student = students.find(s => s.id === otherId);
    if (student) {
        // If I am a tutor, I want to see the Student's Name AND ID
        const subtext = currentUser.role === 'tutor' ? `Student ID: ${student.id}` : undefined;
        return { name: student.name, avatar: student.avatar, role: 'Student', subtext };
    }

    // Fallback if user not found in lists (e.g. deleted user)
    return { name: 'Unknown User', avatar: `https://ui-avatars.com/api/?name=Unknown&background=random`, role: 'User', subtext: `ID: ${otherId}` };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && activeSessionId) {
      onSendMessage(activeSessionId, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-300">
      
      {/* Sidebar List */}
      <div className={`w-full md:w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col ${activeSessionId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No conversations yet.</p>
            </div>
          ) : (
            sessions.map(session => {
              const info = getParticipantInfo(session);
              const isActive = session.id === activeSessionId;
              const hasUnread = session.unreadCount > 0;
              
              return (
                <div 
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-900' : 'bg-white dark:bg-slate-800'}`}
                >
                  <div className="relative flex-shrink-0">
                    {info.isMonitoring ? (
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                            <Users className="w-6 h-6" />
                        </div>
                    ) : (
                        <img src={info.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(info.name)}`} alt={info.name} className="w-12 h-12 rounded-full object-cover" />
                    )}
                    
                    {info.role === 'Admin' && (
                       <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                    )}
                    {info.isMonitoring && (
                       <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-400 border-2 border-white dark:border-slate-800 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`font-semibold truncate text-sm ${isActive ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white'} ${hasUnread ? 'font-bold' : ''}`}>
                          {info.name}
                      </h4>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 whitespace-nowrap">{session.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {info.subtext && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mb-0.5 truncate">
                            {info.subtext}
                        </div>
                    )}
                    <div className="flex items-center gap-1 justify-between">
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                            {info.isMonitoring && <Shield className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />}
                            <p className={`text-xs truncate ${isActive ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-500 dark:text-slate-400'} ${hasUnread ? 'font-bold text-slate-900 dark:text-white' : ''}`}>
                            {session.lastMessagePreview || "Start chatting..."}
                            </p>
                        </div>
                        {hasUnread && (
                            <span className="ml-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                {session.unreadCount}
                            </span>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeSession ? (
        <div className={`flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 ${!activeSessionId ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => onSelectSession('')} className="md:hidden p-1 text-slate-500 dark:text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              {getParticipantInfo(activeSession).isMonitoring ? (
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Users className="w-6 h-6" />
                  </div>
              ) : (
                  <img src={getParticipantInfo(activeSession).avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getParticipantInfo(activeSession).name)}`} alt="" className="w-10 h-10 rounded-full object-cover" />
              )}
              
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {getParticipantInfo(activeSession).name}
                    {getParticipantInfo(activeSession).isMonitoring && <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">Monitoring</span>}
                </h3>
                {getParticipantInfo(activeSession).subtext ? (
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                        {getParticipantInfo(activeSession).subtext}
                    </span>
                ) : (
                    !getParticipantInfo(activeSession).isMonitoring && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                        </span>
                    )
                )}
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeSession.messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              
              const info = getParticipantInfo(activeSession);
              let alignRight = isMe;
              let bubbleColor = isMe ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700';
              
              if (info.isMonitoring) {
                  // Admin is watching. 
                  const isTutorSender = tutors.some(t => t.id === msg.senderId);
                  
                  if (isTutorSender) {
                      alignRight = true;
                      bubbleColor = 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100'; // Distinct color for Tutor in monitoring
                  } else {
                      alignRight = false;
                      bubbleColor = 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700';
                  }
              }

              return (
                <div key={msg.id} className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${bubbleColor} ${alignRight ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                    {info.isMonitoring && (
                        <p className="text-[10px] font-bold mb-1 opacity-70 uppercase tracking-wide">
                            {tutors.find(t => t.id === msg.senderId)?.name || 'Student'}
                        </p>
                    )}
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right opacity-60`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="bg-white dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-100 dark:bg-slate-700 dark:text-white border-none rounded-full px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder-slate-400"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-lg font-medium">Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;