import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatPopup from './ChatPopup';
import { MessageCircle, LogOut, User, BookOpen, GraduationCap } from 'lucide-react';

const Landing: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI Academic Companion</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Welcome, <span className="text-indigo-600">{user?.username}</span>!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your AI-powered academic companion is here to help you navigate your educational journey. 
            Get instant answers about exam schedules, academic policies, and much more.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition duration-300">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <BookOpen className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Academic Calendar</h3>
            <p className="text-gray-600">
              Get up-to-date information about exam schedules, important dates, and academic deadlines.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition duration-300">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <MessageCircle className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Chat Support</h3>
            <p className="text-gray-600">
              Ask questions anytime and get immediate, accurate responses from our AI assistant.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition duration-300 md:col-span-2 lg:col-span-1">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <GraduationCap className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Academic Guidance</h3>
            <p className="text-gray-600">
              Receive personalized guidance and support for your academic journey and goals.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Click the chat icon to begin your conversation with our AI assistant. 
            Ask about exam dates, academic policies, or any other academic questions you have.
          </p>
          <button
            onClick={() => setIsChatOpen(true)}
            className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transition duration-200 transform hover:scale-105"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Start Chatting
          </button>
        </div>
      </main>

      {/* Chat Popup Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-110 z-50"
        >
          <MessageCircle className="h-7 w-7 mx-auto" />
        </button>
      )}

      {/* Chat Popup */}
      <ChatPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Landing;