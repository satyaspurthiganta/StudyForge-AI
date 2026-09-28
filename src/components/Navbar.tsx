import React from 'react';
import { BookOpen, Sparkles, FileText, CheckCircle2, MessageSquare, BarChart2 } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'materials' | 'notes' | 'quiz' | 'progress' | 'chat';
  onSelectTab: (tab: 'home' | 'materials' | 'notes' | 'quiz' | 'progress' | 'chat') => void;
  activeTopic: string;
  filesCount: number;
  onTrySample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeTopic,
  filesCount,
  onTrySample,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-serif-display block leading-none">
              StudyForge AI
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 block mt-0.5">
              Smart Academic Prep
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'home'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onSelectTab('materials')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'materials'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Study Material</span>
            {filesCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 text-indigo-700 bg-indigo-50 rounded-md font-mono">
                {filesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'notes'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>AI Notes</span>
          </button>

          <button
            onClick={() => onSelectTab('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'quiz'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
            <span>MCQ Quiz</span>
          </button>

          <button
            onClick={() => onSelectTab('progress')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'progress'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-slate-500" />
            <span>Progress & Weak Areas</span>
          </button>

          <button
            onClick={() => onSelectTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'chat'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Ask Material</span>
          </button>
        </nav>

        {/* Zone 3: Quick Action & Active Context */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeTopic && activeTopic !== 'Entire Material' && (
            <div className="hidden xl:flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              <span className="text-slate-400">Topic:</span>
              <span className="font-medium text-slate-700 max-w-[140px] truncate">{activeTopic}</span>
            </div>
          )}

          <button
            onClick={onTrySample}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
          >
            <span>Try Sample</span>
          </button>

          <button
            onClick={() => onSelectTab('materials')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
          >
            Start Studying
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 px-2 py-1.5 bg-slate-50 text-xs">
        <button
          onClick={() => onSelectTab('home')}
          className={`px-2 py-1 rounded-md font-medium ${currentTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          Home
        </button>
        <button
          onClick={() => onSelectTab('materials')}
          className={`px-2 py-1 rounded-md font-medium ${currentTab === 'materials' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          Material
        </button>
        <button
          onClick={() => onSelectTab('notes')}
          className={`px-2 py-1 rounded-md font-medium ${currentTab === 'notes' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          Notes
        </button>
        <button
          onClick={() => onSelectTab('quiz')}
          className={`px-2 py-1 rounded-md font-medium ${currentTab === 'quiz' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          Quiz
        </button>
        <button
          onClick={() => onSelectTab('progress')}
          className={`px-2 py-1 rounded-md font-medium ${currentTab === 'progress' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          Progress
        </button>
        <button
          onClick={() => onSelectTab('chat')}
          className={`px-2 py-1 rounded-md font-medium ${currentTab === 'chat' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          Ask
        </button>
      </div>
    </header>
  );
};
