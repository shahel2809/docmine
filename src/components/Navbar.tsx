import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'library'
  | 'ask'
  | 'notes'
  | 'visual'
  | 'quiz'
  | 'mistakes'
  | 'planner'
  | 'progress'
  | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingMistakesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingMistakesCount
}) => {
  const navItems: Array<{ id: ActiveTab; label: string; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'library', label: 'My Library' },
    { id: 'ask', label: 'Ask DocuMind' },
    { id: 'notes', label: 'Smart Notes' },
    { id: 'visual', label: 'Visual Learning' },
    { id: 'quiz', label: 'Quiz Arena' },
    { id: 'mistakes', label: 'Mistakes Log', badge: pendingMistakesCount > 0 ? pendingMistakesCount : undefined },
    { id: 'planner', label: 'Study Planner' },
    { id: 'progress', label: 'Progress' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">
              DocuMind
            </span>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 overflow-x-auto py-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-sm font-medium whitespace-nowrap transition-colors relative py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded ${
                    isActive
                      ? 'text-indigo-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.badge !== undefined && (
                      <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-mono font-medium">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('ask')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Question</span>
            </button>
          </div>
        </div>

        {/* Mobile horizontal scroll nav */}
        <div className="lg:hidden flex items-center gap-4 overflow-x-auto py-2.5 border-t border-slate-100 no-scrollbar">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-xs font-medium whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {item.badge !== undefined && ` (${item.badge})`}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
